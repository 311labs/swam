#!/usr/bin/env python3

import os
import time
import glob
from optparse import OptionParser
from io import StringIO
import json
import sass
import rcssmin
import rjsmin
import htmlmin
from objict import nobjict, objict
from datetime import datetime
import time
import threading
import shutil


parser = OptionParser()
parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False)
parser.add_option("-f", "--force", action="store_true", dest="force", default=False, help="force the revision")
parser.add_option("-m", "--minify", action="store_true", dest="minify", default=False, help="minify the revision")
parser.add_option("-w", "--watch", action="store_true", dest="watch", default=False, help="watch for changes and auto refresh")
parser.add_option("-s", "--serve", action="store_true", dest="serve", default=False, help="serve for changes and auto refresh")
parser.add_option("-o", "--output", type="str", dest="output", default="output", help="static output path")
parser.add_option("-p", "--port", type="int", dest="port", default="8081", help="http port")
parser.add_option("-b", "--bump_rev", action="store_true", dest="bump_rev", default=False, help="bump version revision")
parser.add_option("--bump_minor", action="store_true", dest="bump_minor", default=False, help="bump version minor")
parser.add_option("--bump_major", action="store_true", dest="bump_major", default=False, help="bump version major")
parser.add_option("--app_path", type="str", dest="app_path", default="apps", help="app path to compile from")

version = "0.1.1"
compile_info = nobjict(is_compiling=False)


def readVersion():
    with open("pyproject.toml", "r") as f:
        for line in f.readlines():
            if line.startswith("version ="):
                return line.strip().split('=')[1].strip().replace('"', '')
    return version


def bumpVersion(bump_major=False, bump_minor=False, bump_rev=True):
    output = []
    with open("pyproject.toml", "r") as rf:
        for line in rf.readlines():
            if line.startswith("version ="):
                v = line.strip().split('=')[1].strip().replace('"', '')
                major, minor, rev = v.split('.')
                if bump_major:
                    major = int(major) + 1
                if bump_minor:
                    minor = int(minor) + 1
                if bump_rev:
                    rev = int(rev) + 1
                line = 'version = "{}.{}.{}"\n'.format(major, minor, rev)
                print(line)
            output.append(line)
    with open("pyproject.toml", "w") as wf:
        for line in output:
            wf.write(line)
    return version


version = readVersion()


class FileCache():
    def __init__(self, filename=".swam_cache"):
        self.filename = filename
        self.cache = nobjict.fromFile(self.filename, True)

    def save(self):
        self.cache.save(self.filename)

    def anyChanged(self):
        for path in self.cache:
            if not os.path.exists(path):
                self.removeOld()
                return True
            if self.cache[path].mtime != os.path.getmtime(path):
                print(path)
                print(self.cache[path].mtime)
                return True
        return False

    def hasPath(self, path):
        return path in self.cache

    def getPath(self, path, outpath, update=False):
        if not update and self.hasPath(path):
            return self.cache[path]
        is_merge_file = False
        ext = os.path.splitext(path)[1]
        if ext in [".css", ".js", ".scss", ".html"]:
            with open(path, 'r') as f:
                is_merge_file = f.readline().startswith("#!#MERGE")
        self.cache[path] = nobjict(mtime=os.path.getmtime(path), is_merge_file=is_merge_file, outpath=outpath)
        self.save()
        return self.cache[path]

    def removeOld(self):
        remove = []
        for path in self.cache:
            if not os.path.exists(path):
                print("removing: {}".format(path))
                remove.append((path, self.cache[path]))
        for path, info in remove:
            self.cache.pop(path)
            if os.path.exists(info.outpath):
                os.remove(info.outpath)
        self.save()


FILE_CACHE = FileCache()

SWAM_CACHE = {}


class SwamFile():
    def __init__(self, path, static_folder="static", force=False, minify_flag=False, output_path=None):
        self.path = path
        self.static_folder = static_folder
        self.output_path = output_path
        if self.output_path is None:
            self.output_path = os.path.join(self.static_folder, self.path)
        self.root = os.path.dirname(self.path)
        self.force = force
        self.minify_flag = minify_flag
        self.info = FILE_CACHE.getPath(self.path, self.output_path)
        self.children = []

    def hasChanged(self):
        if self.info.is_merge_file:
            return self.hasChildChanged()
        if not os.path.exists(self.output_path):
            return True
        return self.hasModified()

    def hasModified(self):
        mtime = os.path.getmtime(self.path)
        return self.info.mtime != mtime

    def hasChildChanged(self):
        # check if children have changed
        if not os.path.exists(self.output_path) or self.hasModified():
            return True
        if not self.children:
            self.parse()
        for path in self.children:
            child = SwamFile(path, self.static_folder, force=self.force)
            if child.hasChanged():
                print("\t\t{}\t\thas changes".format(child.path))
                return True
        return False

    def readAll(self):
        if self.force or self.hasChanged():
            self.compile()
        with open(self.output_path, 'r') as f:
            return f.read()

    def compile(self, **kwargs):
        # if this is a merge file, merge and save to static
        # if not merge file then save to static
        self.meta = objict.fromdict(kwargs)  # used with some compilers for extra info or flags
        static_root = os.path.dirname(self.output_path)
        if not os.path.exists(self.static_folder):
            os.mkdir(self.static_folder)
        if not os.path.exists(static_root):
            os.makedirs(static_root)

        self.on_open()
        if not self.info.is_merge_file:
            self.copyFile()
        else:
            self.merge()
        self.on_close()
        print("\t{}\tregenerated".format(self.output_path))
        self.info = FILE_CACHE.getPath(self.path, self.output_path, update=True)

    def on_open(self):
        self.output = open(self.output_path, "w")

    def on_close(self):
        self.output.close()

    def copyFile(self):
        with open(self.path, "r") as f:
            self.output.write(f.read())

    def merge(self):
        if not self.children:
            self.parse()     
        for path in self.children:
            self.mergeFile(path)

    def parse(self):
        # generate paths to all valid children
        self.children = []
        with open(self.path, "r") as f:
            for line in f.readlines():
                line = line.strip()
                if line.startswith("#") or len(line) < 2:
                    continue
                if line.startswith("/"):
                    rpath = line[1:]
                else:
                    rpath = os.path.join(self.root, line)
                self._addPath(rpath, f)

    def mergeFile(self, path):
        sf = SwamFile(path, self.static_folder, force=self.force)
        print("\tadding: {}".format(path))
        self.output.write(sf.readAll())

    def _addPath(self, path, f):
        if path in self.children:
            return
        
        if "*" in path:
            for spath in glob.glob(path):
                self._addPath(spath, f)
        elif os.path.exists(path):
            self.children.append(path)
        else:
            print("not found: {}".format(path))


class JSFile(SwamFile):
    def on_open(self):
        self.output = open(self.output_path, "w")
        if self.output_path.endswith("app.js"):
            self.output.write("window.swam_version='{}';\n".format(version))

    def mergeFile(self, path):
        sf = JSFile(path, self.static_folder, force=self.force)
        if self.minify_flag:
            self.output.write(rjsmin.jsmin(sf.readAll()))
        else:
            self.output.write(sf.readAll())
        self.output.write("\n\n")


class MustacheFile(SwamFile):
    data = dict()

    def on_close(self):
        self.data["version"] = version
        self.output.write("window.template_cache = ")
        self.output.write(json.dumps(self.data, indent=2))
        self.output.write(";")
        self.output.close()

    def minify(self, value):
        return htmlmin.minify(value, remove_all_empty_space=True, remove_comments=True, keep_pre=True)
        # split = value.split()
        # return " ".join(split)

    def setKey(self, path, value):
        nodes = path.split(os.sep)
        data = self.data
        for n in nodes[:-1]:
            if n not in data:
                data[n] = dict()
            data = data[n]
        data[nodes[-1].split('.')[0]] = value

    def mergeFile(self, path):
        sf = SwamFile(path, self.static_folder, force=self.force)
        self.setKey(path, self.minify(sf.readAll()))


class SCSSFile(SwamFile):
    def mergeFile(self, path):
        sf = SCSSFile(path, self.static_folder, force=self.force)
        print(path)
        self.raw_scss.write("/** {} */\n".format(path))
        lines = sf.readAll().split("\n")
        for line in lines:
            if not line.strip().startswith("//"):
                self.raw_scss.write(line)
                self.raw_scss.write("\n")

    def on_open(self):
        self.raw_scss = StringIO()
        self.output = open(self.output_path, "w")

    def on_close(self):
        try:
            raw = self.raw_scss.getvalue()
            if len(raw) > 8:
                if self.minify_flag:
                    self.output.write(rcssmin.cssmin(sass.compile(string=raw)))
                else:
                    self.output.write(sass.compile(string=raw))
        except Exception as err:
            reason = str(err)
            if "Undefined variable" in reason:
                print(reason)
            else:
                print(reason)
                key = "on line "
                if key in reason:
                    pos = reason.find(key) + len(key)
                    lno = reason[pos:pos+8]
                    lno, col = lno[:lno.find(' ')].split(':')
                    lno = int(lno)
                lines = raw.split('\n')
                subview = lines[max(lno-8, 0):lno+8]
                print("\n".join(subview))
        self.output.close()

    @staticmethod
    def simpleLint(source, name):
        open_brackets = 0
        comment = False
        comment_close = None
        lines = source.split('\n')
        lineno = 0
        open_line = 0
        for line in lines:
            lineno += 1
            if comment:
                if comment_close in line:
                    line = line[line.find(comment_close)+len(comment_close):]
                else:
                    continue
            if '//' in line:
                line = line[:line.find('//')]
            if '/*' in line:
                comment = True
                comment_close = '*/'
                prefix = line[:line.find('/*')]
                if comment_close in line:
                    postfix = line[line.find(comment_close)+len(comment_close):]
                    line = prefix + " " + postfix
                    comment = False
                else:
                    line = prefix
            for i in line:
                if i == '{':
                    if open_brackets == 0:
                        open_line = lineno
                    open_brackets += 1
                elif i == '}':
                    open_brackets -= 1
                if open_brackets < 0:
                    print("="*80)
                    print(name)
                    print(lineno)
                    print("ERROR unexpected closing bracket")
                    print("="*80)
        if open_brackets > 0:
            print("="*80)
            print(name)
            print(lineno)
            print("ERROR unexpected open brackets {} starting on {}".format(open_brackets, open_line))
            print("="*80)


class StaticFile(SwamFile):
    def on_open(self):
        pass

    def on_close(self):
        pass

    def copyFile(self):
        shutil.copy(self.path, self.output_path)


class IndexFile(SwamFile):
    INDEX_VARS = ["version", "js_includes", "css_includes", "title"]
    JS_INCLUDE_TEMP = """<script type="text/javascript" src="{{path}}?version={{version}}"></script>"""
    CSS_INCLUDE_TEMP = """<link rel="stylesheet" href="{{path}}?version={{version}}">"""

    def copyFile(self):
        with open(self.path, "r") as f:
            html = f.read()
            if self.meta:
                for key in IndexFile.INDEX_VARS:
                    if key in self.meta:
                        if key == "js_includes":
                            output = []
                            for item in self.meta.get(key):
                                output.append(IndexFile.JS_INCLUDE_TEMP.replace("{{path}}", item).replace("{{version}}", self.meta.version))
                            value = "\n".join(output)
                        elif key == "css_includes":
                            output = []
                            for item in self.meta.get(key):
                                output.append(IndexFile.CSS_INCLUDE_TEMP.replace("{{path}}", item).replace("{{version}}", self.meta.version))
                            value = "\n".join(output)
                        else:
                            value = self.meta[key]
                        html = html.replace("{{" + key + "}}", value)
            self.output.write(html)


def buildIncludes(FileClass, app_path, includes, output, static_paths, opts):
    is_dirty = False
    for ipath in includes:
        fpath = ipath
        if not fpath.startswith("/"):
            fpath = os.path.join(app_path, ipath)
        else:
            fpath = fpath[1:]  # remove the leading path
        js = FileClass(fpath, opts.output, force=opts.force, minify_flag=opts.minify)
        if opts.force or js.hasChanged():
            is_dirty = True
            js.compile()
        print(static_paths)
        print(ipath)
        if static_paths and not ipath.startswith("/"):
            ipath = "/" + os.path.join(app_path, ipath)
            print(ipath)
        output.append(ipath)
    return is_dirty


def buildApp(app_path, config, opts):
    is_dirty = False
    js_includes = []
    css_includes = []

    if config.js_files:
        if buildIncludes(JSFile, app_path, config.js_files, js_includes, config.static_paths, opts):
            is_dirty = True

    if config.mustache_files:
        if buildIncludes(MustacheFile, app_path, config.mustache_files, js_includes, config.static_paths, opts):
            is_dirty = True

    if config.css_files:
        if buildIncludes(SCSSFile, app_path, config.css_files, css_includes, config.static_paths, opts):
            is_dirty = True

    if config.static_files:
        copyStatic(app_path, config.static_files, opts)

    fpath = config.get("index_file", "/plugins/swam/templates/basic.html")
    if not fpath.startswith("/"):
        fpath = os.path.join(app_path, fpath)
    else:
        fpath = fpath[1:]  # remove the leading path

    output_path = os.path.join(opts.output, app_path, "index.html")
    index = IndexFile(fpath, opts.output, force=True, output_path=output_path)
    if is_dirty or index.hasChanged():
        # load to check for any changes
        config = objict.fromFile(os.path.join(app_path, "app.json"))
        # bump local version
        if config.version is None:
            config.version = "1.0.0"
        major, minor, rev = config.version.split('.')
        rev = int(rev) + 1
        config.version = "{}.{}.{}".format(major, minor, rev)
        config.save(os.path.join(app_path, "app.json"))
        index.compile(js_includes=js_includes, css_includes=css_includes, **config)


APPS = objict()
APP_PATHS = objict()


def copyCore(path, opts):
    js = JSFile(path, opts.output, force=opts.force, minify_flag=opts.minify)
    if opts.force or js.hasChanged():
        js.compile()


def copyStatic(app_path, path, opts):
    if isinstance(path, list):
        for p in path:
            copyStatic(app_path, p, opts)
        return

    opath = path
    if not path.startswith("/"):
        path = os.path.join(app_path, path)
    else:
        path = path[1:]  # remove the leading path

    if os.path.isdir(path):
        files = [os.path.join(opath, f) for f in os.listdir(path) if not f.startswith(".") and os.path.isfile(os.path.join(path, f))]
        for p in files:
            copyStatic(app_path, p, opts)
        return

    f = StaticFile(path, opts.output, force=opts.force, minify_flag=opts.minify)
    if opts.force or f.hasChanged():
        f.compile()


def buildApps(opts):
    started_at = time.time()
    copyCore(os.path.join("plugins", "jquery.js"), opts)
    compile_info.is_compiling = True
    for name in os.listdir(opts.app_path):
        path = os.path.join(opts.app_path, name)
        if os.path.isdir(path):
            if name not in APPS:
                config_file = os.path.join(path, "app.json")
                if os.path.exists(config_file):
                    try:
                        APPS[name] = objict.fromFile(config_file)
                        APP_PATHS[name] = path
                    except Exception as err:
                        print("-----")
                        print("failed to parse {}".format(config_file))
                        print(str(err))
                        print("-----")

            config = APPS.get(name, None)
            if config and not config.disable:
                app_started_at = time.time()
                buildApp(path, config, opts)
                print("\t{} compile time: {}".format(name, time.time() - app_started_at))
    compile_info.is_compiling = False
    print("total compile time: {:.3f}".format(time.time() - started_at))


class FileWatcher():
    def __init__(self, opts, freq=1.0):
        self.opts = opts
        self._thread = None
        self._watch_freq = freq

    def start(self):
        if self._thread is None:
            self._thread = threading.Thread(target=self.watchLoop)
            self._thread.start()
    
    def stop(self):
        if self._thread is not None:
            self.is_running = False
            self._thread.join()
            self._thread = None

    def watchLoop(self):
        self.is_running = True
        while self.is_running:
            time.sleep(self._watch_freq)
            if FILE_CACHE.anyChanged():
                buildApps(self.opts)
                time.sleep(1.0)


def runHTTP(opts):
    import http.server
    import socketserver
    from urllib.parse import urlparse

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=opts.output, **kwargs)

        def do_GET(self):
            while compile_info.is_compiling:
                time.sleep(0.5)
            for name in APP_PATHS:
                # print(self.path)
                path = urlparse(self.path).path
                ext = os.path.splitext(path)[1]
                # print(ext)
                if path[1:].startswith(name):
                    print(self.path)
                    if not ext:
                        self.path = os.path.join(APP_PATHS[name], 'index.html')
                    else:
                        self.path = "/apps" + self.path
                        # print(self.path)
            return super().do_GET()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", opts.port), Handler) as httpd:
        print("serving at port", opts.port)
        httpd.serve_forever()


def main(opts, args):
    print("== SWAM COMPILER {} ==".format(version))
    if opts.bump_rev or opts.bump_major or opts.bump_minor:
        return bumpVersion(opts.bump_major, opts.bump_minor, opts.bump_rev)
    FILE_CACHE.removeOld()
    buildApps(opts)
    watcher = FileWatcher(opts)
    if opts.watch:
        if opts.serve:
            watcher.start()
        else:
            watcher.watchLoop()
    if opts.serve:
        try:
            runHTTP(opts)
        except KeyboardInterrupt:
            print("stopping...")
            watcher.stop()


if __name__ == '__main__':
    main(*parser.parse_args())

