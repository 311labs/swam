#!/usr/bin/env python3

import os
import sys
import time
import glob
from optparse import OptionParser
from io import StringIO
import json
import sass
import rcssmin
import rjsmin
from objict import nobjict, objict
from datetime import datetime
import time
import threading
import shutil
import configparser

CONFIG = objict.fromFile("swam.conf")

parser = OptionParser()
parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=CONFIG.get("verbose", False))
parser.add_option("-a", "--auto_version", action="store_true", dest="auto_version", default=False, help="auto update app versions on change")
parser.add_option("-f", "--force", action="store_true", dest="force", default=False, help="force the revision")
parser.add_option("-m", "--minify", action="store_true", dest="minify", default=False, help="minify the revision")
parser.add_option("-w", "--watch", action="store_true", dest="watch", default=False, help="watch for changes and auto refresh")
parser.add_option("-s", "--serve", action="store_true", dest="serve", default=False, help="serve for changes and auto refresh")
parser.add_option("-o", "--output", type="str", dest="output", default=CONFIG.get("output_path", "output"), help="static output path")
parser.add_option("-p", "--port", type="int", dest="port", default=CONFIG.get("port", 8081), help="http port")
parser.add_option("-b", "--bump_rev", action="store_true", dest="bump_rev", default=False, help="bump version revision")
parser.add_option("--bump_minor", action="store_true", dest="bump_minor", default=False, help="bump version minor")
parser.add_option("--bump_major", action="store_true", dest="bump_major", default=False, help="bump version major")
parser.add_option("--clear", action="store_true", dest="clear", default=False, help="clear all cache")
parser.add_option("--app_path", type="str", dest="app_path", default=CONFIG.get("app_path", "apps"), help="app path to compile from")

version = "0.1.7"
compile_info = nobjict(is_compiling=False, verbose=False)


class Colors:
    BLACK = "\033[30m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    PINK = "\033[35m"
    BLUE = "\033[34m"
    WHITE = "\033[37m"

    HBLACK = "\033[90m"
    HRED = "\033[91m"
    HGREEN = "\033[92m"
    HYELLOW = "\033[93m"
    HBLUE = "\033[94m"
    HPINK = "\033[95m"
    HWHITE = "\033[97m"

    HEADER = "\033[95m"
    FAIL = "\033[91m"
    OFF = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


def pp(color, msg):
    sys.stdout.write("{}{}{}\n".format(color, msg, Colors.OFF))
    sys.stdout.flush()


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
            output.append(line)
    with open("pyproject.toml", "w") as wf:
        for line in output:
            wf.write(line)
    return version


version = readVersion()


def getGitBranch():
    branch_file = os.path.join(".git", "HEAD")
    if os.path.exists(branch_file):
        try:
            with open(branch_file, "r") as f:
                line = f.read().strip()
                return line.split('/')[-1]
        except Exception:
            pass
    return None


class FileCache():
    def __init__(self, filename=".swam_cache"):
        self.filename = filename
        self.cache = nobjict.fromFile(self.filename, True)

    def clear(self):
        self.cache.clear()
        self.save()

    def save(self):
        self.cache.save(self.filename)

    def anyChanged(self):
        for path in self.cache:
            if not os.path.exists(path):
                self.removeOld()
                return True
            if self.cache[path].mtime != os.path.getmtime(path):
                if compile_info.verbose:
                    pp(Colors.YELLOW, F"CHANGED: {path} - {self.cache[path].mtime}")
                return True
        return False

    def clearChanges(self):
        for path in self.cache:
            self.cache[path].mtime = os.path.getmtime(path)
        self.save()
        return True

    def hasPath(self, path):
        return path in self.cache

    def getPath(self, path, outpath, update=False):
        if not update and self.hasPath(path):
            return self.cache[path]
        is_merge_file = False
        ext = os.path.splitext(path)[1]
        options = nobjict()
        if ext in [".css", ".js", ".scss", ".html"]:
            if not os.path.exists(path):
                pp(Colors.RED, F"CRITICAL ERROR FILE NOT FOUND: {path}")
                sys.exit(1)
                # return nobjict(mtime=0, is_merge_file=False, outpath=outpath, options=options)
            with open(path, 'r') as f:
                line = f.readline().strip()
                is_merge_file = line.startswith("#!#MERGE")
                if is_merge_file and " " in line:
                    for item in line.split(' ')[1:]:
                        if ":" in item:
                            k, v = item.split(':')
                            options[k] = v
        elif not os.path.exists(path):
            pp(Colors.RED, F"CRITICAL ERROR PATH NOT FOUND: {path}")
            if self.hasPath(path):
                del self.cache[path]
                self.save()
            raise Exception(f"path: '{path}' does not exist!")
            
        self.cache[path] = nobjict(mtime=os.path.getmtime(path), is_merge_file=is_merge_file, outpath=outpath, options=options)
        self.save()
        return self.cache[path]

    def removeOld(self):
        remove = []
        for path in self.cache:
            if not os.path.exists(path):
                pp(Colors.RED, "- removing: {}".format(path))
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
                pp(Colors.YELLOW, "\t\t{}\t\thas changes".format(child.path))
                return True
        return False

    def readAll(self):
        if self.force or self.hasChanged():
            self.compile()
        if os.path.isdir(self.output_path):
            pp(Colors.RED, f"CRITICAL ERROR: Trying to read file but file is a directory!\n\tsource:\t{self.path}\n\toutput:\t{self.output_path}")
            sys.exit(1)
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
        if compile_info.verbose:
            pp(Colors.BLUE, "\t{}\tregenerated".format(self.output_path))
        self.info = FILE_CACHE.getPath(self.path, self.output_path, update=False)

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
                elif line.startswith("./"):
                    rpath = os.path.join(self.root, line[2:])
                else:
                    rpath = os.path.join(self.root, line)
                self._addPath(rpath, f)

    def mergeFile(self, path):
        sf = SwamFile(path, self.static_folder, force=self.force)
        if compile_info.verbose:
            pp(Colors.GREEN, "\tadding: {}".format(path))
        self.output.write(sf.readAll())

    def _addPath(self, path, f):
        if path in self.children:
            return
        
        if path == self.path:
            pp(Colors.RED, F"attempting to include parent path as child! {path}")
            return
          
        if "*" in path:
            if path.startswith("*"):
                pp(Colors.RED, f"\nINVALID INCLUDE: {path}")
                pp(Colors.RED, f"'*' prefix not allowed\nlocated in file: {self.path}\n")
                return
            for spath in glob.glob(path, recursive=True):
                self._addPath(spath, f)
        elif os.path.exists(path):
            self.children.append(path)
        else:
            if compile_info.verbose:
                pp(Colors.HBLUE, self.path)
                pp(Colors.RED, f"\tnot found: {path}")
            else:
                pp(Colors.RED, f"not found: {path}")


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

    def on_open(self):
        self.data = dict()
        self.output = open(self.output_path, "w")

    def on_close(self):
        self.output.write("window.template_cache = window.template_cache || {};\n")
        # here we allow independent top level includes
        if self.info.options:
            if self.info.options.ignore_prefix:
                prefix = self.info.options.ignore_prefix.split('.')
                for key in prefix:
                    if key in self.data:
                        self.data = self.data[key]
        # self.data["version"] = version
        if CONFIG.allow_template_merge:
            print(self.output_path)
            self.write_template_merged()
        else:
            self.write_template()
        self.output.close()

    def write_template(self):
        for key in self.data:
            data = self.data[key]
            self.output.write(F"window.template_cache['{key}'] = ")
            self.output.write(json.dumps(data, indent=2))
            self.output.write(";\n")

    def _writeTemplateVar(self, data, tvar, depth=0):
        if isinstance(data, dict):
            if depth > CONFIG.allow_template_merge:
                self.output.write(f'{tvar} =')
                self.output.write(json.dumps(data, indent=2))
                self.output.write(";\n")
                return
            self.output.write(f"{tvar} = {tvar} || {{}};\n")
            for key in data:
                tvar = f"{tvar}.{key}"
                self._writeTemplateVar(data[key], tvar, depth+1)
        else:
            self.output.write(f'{tvar} = "{data}";\n')

    def write_template_merged(self):
        for key in self.data:
            tvar = F"window.template_cache.{key}"
            self._writeTemplateVar(self.data[key], tvar, 1)

    def minify(self, value):
        # htmlmin is breaking mustache inside attributes
        if CONFIG.disable_html_minify:
            return value
        tmin = HTMLMinifier()
        return tmin.minify(value)
        # return htmlmin.minify(
        #     value,
        #     remove_optional_attribute_quotes=False,
        #     reduce_boolean_attributes=False,
        #     reduce_empty_attributes=False,
        #     remove_all_empty_space=True,
        #     remove_comments=True,
        #     keep_pre=True)
        # return value.replace('\n', '').replace('\t', '').replace(' ', '')
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
        if os.name == "nt":
            path = path.replace("/", os.sep)
        self.setKey(path, self.minify(sf.readAll()))


from html.parser import HTMLParser
NO_CLOSE_TAGS = ('area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img',
                 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track',
                 'wbr')

# We might need to stop using htmlmin as it is not compatible with mustache
# attempt at a simple minimizer
class HTMLMinifier(HTMLParser):
    def __init__(self):
        self.is_in_pre = False
        self.pre_tags = ["pre", "textarea"]
        HTMLParser.__init__(self, convert_charrefs=False)

    def minify(self, value):
        self.output = []
        self.feed(value)
        return "".join(self.output)

    def handle_starttag(self, tag, attrs):
        if tag.lower() in self.pre_tags:
            self.is_in_pre = True
        # print("Encountered a start tag:", tag, attrs)
        self.output.append(self.get_starttag_text())

    def handle_endtag(self, tag):
        if tag.lower() in self.pre_tags:
            self.is_in_pre = False
        if tag not in NO_CLOSE_TAGS:
            self.output.append(f"</{tag}>")
        # print("Encountered an end tag :", tag)

    # def handle_startendtag(self, tag, attrs):
    #     self._after_doctype = False
    #     data = self.build_tag(tag, attrs, tag not in NO_CLOSE_TAGS)[1]
    #     self._data_buffer.append(data)

    def handle_comment(self, data):
        pass

    def handle_data(self, data):
        # print("Encountered some data  :", repr(data))
        if self.is_in_pre:
            self.output.append(data)
        else:
            self.output.append(data.replace('\n', '').replace('\t', '').replace('  ', ' ').replace('  ', ' '))

    def handle_entityref(self, data):
        self.output.append('&{};'.format(data))

    def handle_charref(self, data):
        self.output.append('&#{};'.format(data))

    def handle_pi(self, data):
        self.output.append('<?' + data + '>')

    def handle_decl(self, decl):
        self.output.append('<!' + decl + '>')

    def unknown_decl(self, data):
        self.output.append('<![' + data + ']>')


class SCSSFile(SwamFile):
    def mergeFile(self, path):
        sf = SCSSFile(path, self.static_folder, force=self.force)
        if compile_info.verbose:
            print(f"\tmerging: {path}")
        lines = sf.readAll().split("\n")
        ll = len(lines)
        self.raw_scss.write(f"/** {path} {ll} */\n")
        
        for line in lines:
            if not line.strip().startswith("//"):
                self.raw_scss.write(line)
                self.raw_scss.write("\n")

    def on_open(self):
        self.raw_scss = StringIO()
        self.output = open(self.output_path, "w")

    def on_close(self):
        if not self.info.is_merge_file:
            self.on_close_scss()
        elif self.output_path.endswith(".scss"):
            self.on_close_scss()
        else:
            self.on_close_css()

    def on_close_scss(self):
        raw = self.raw_scss.getvalue()
        self.output.write(raw)
        self.output.close()

    def on_close_css(self):
        raw = self.raw_scss.getvalue()
        if compile_info.verbose:
            print(f"compiling: {self.path}")
            with open(self.output_path + ".debug.scss", "w") as f:
                f.write(raw)
        try:
            if len(raw) > 8:
                if self.minify_flag:
                    self.output.write(rcssmin.cssmin(sass.compile(string=raw)))
                else:
                    self.output.write(sass.compile(string=raw))
        except Exception as err:
            reason = str(err)
            if "Undefined variable" in reason:
                pp(Colors.RED, reason)
            else:
                pp(Colors.RED, reason)
                key = "on line "
                if key in reason:
                    pos = reason.find(key) + len(key)
                    lno = reason[pos:pos+8]
                    lno, col = lno[:lno.find(' ')].split(':')
                    lno = int(lno)
                lines = raw.split('\n')
                subview = lines[max(lno-8, 0):lno+8]
                pp(Colors.RED, "\n".join(subview))
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
                    pp(Colors.RED, "="*80)
                    pp(Colors.RED, name)
                    pp(Colors.RED, lineno)
                    pp(Colors.RED, "ERROR unexpected closing bracket")
                    pp(Colors.RED, "="*80)
        if open_brackets > 0:
            pp(Colors.RED, "="*80)
            pp(Colors.RED, name)
            pp(Colors.RED, lineno)
            pp(Colors.RED, "ERROR unexpected open brackets {} starting on {}".format(open_brackets, open_line))
            pp(Colors.RED, "="*80)


class StaticFile(SwamFile):
    def on_open(self):
        pass

    def on_close(self):
        pass

    def copyFile(self):
        shutil.copy(self.path, self.output_path)


class IndexFile(SwamFile):
    INDEX_VARS = ["version", "branch", "js_includes", "css_includes", "title", "root", "template_root", "app_root", "loader_color", "no_es6_site"]
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
        if not os.path.exists(fpath):
            pp(Colors.RED, F"WARNING...MISSING FILE: {fpath}")
            continue
        js = FileClass(fpath, opts.output, force=opts.force, minify_flag=opts.minify)
        if opts.force or js.hasChanged():
            is_dirty = True
            js.compile()
        # print(static_paths)
        if static_paths and not ipath.startswith("/"):
            ipath = "/" + os.path.join(app_path, ipath)
            # print(ipath)
        output.append(ipath)
    return is_dirty


def buildApp(app_path, app_config, opts):
    is_dirty = False
    js_includes = []
    css_includes = []

    pp(Colors.PINK, app_path)
    if app_config.mustache_files:
        if buildIncludes(MustacheFile, app_path, app_config.mustache_files, js_includes, app_config.static_paths, opts):
            is_dirty = True

    if app_config.js_files:
        if buildIncludes(JSFile, app_path, app_config.js_files, js_includes, app_config.static_paths, opts):
            is_dirty = True

    if app_config.css_files:
        if buildIncludes(SCSSFile, app_path, app_config.css_files, css_includes, app_config.static_paths, opts):
            is_dirty = True

    if app_config.static_files:
        copyStatic(app_path, app_config.static_files, opts)

    fpath = app_config.get("index_file", "/plugins/swam/templates/basic.html")
    if not fpath.startswith("/"):
        fpath = os.path.join(app_path, fpath)
    else:
        fpath = fpath[1:]  # remove the leading path

    output_path = os.path.join(opts.output, app_path, "index.html")
    index = IndexFile(fpath, opts.output, force=True, output_path=output_path)
    if is_dirty or index.hasChanged():
        # load to check for any changes
        app_config = objict.fromFile(os.path.join(app_path, "app.json"))
        if os.name == "nt":
            app_path = app_path.replace("\\", "/")
        app_config.template_root = "{}".format(app_path.replace("/", "."))
        # bump local version
        if app_config.loader_color is None:
            app_config.loader_color = "#598A77"
        if app_config.version is None:
            app_config.version = "1.0.0"
        app_config.branch = compile_info.branch
        if opts.auto_version:
            major, minor, rev = app_config.version.split('.')
            rev = int(rev) + 1
            app_config.version = "{}.{}.{}".format(major, minor, rev)
            app_config.save(os.path.join(app_path, "app.json"))
        app_config.root = app_path
        index.compile(js_includes=js_includes, css_includes=css_includes, app_root=app_path[len("apps"):], **app_config)


APPS = objict()
APP_PATHS = objict()


def copyCore(path, opts):
    js = JSFile(path, opts.output, force=opts.force, minify_flag=opts.minify)
    if opts.force or js.hasChanged():
        js.compile()


def copyStatic(app_path, path, opts):
    if isinstance(path, list):
        for p in path:
            try:
                copyStatic(app_path, p, opts)
            except Exception:
                pass
        return

    opath = path
    if not path.startswith("/"):
        path = os.path.join(app_path, path)
    else:
        path = path[1:]  # remove the leading path

    if os.path.isdir(path):
        files = [os.path.join(opath, f) for f in os.listdir(path) if not f.startswith(".") and os.path.join(path, f)]
        for p in files:
            copyStatic(app_path, p, opts)
        return

    f = StaticFile(path, opts.output, force=opts.force, minify_flag=opts.minify)
    if opts.force or f.hasChanged():
        f.compile()


def buildApps(opts):
    started_at = time.time()
    for path in opts.plugins:
        jqfile = os.path.join(path, "jquery.js")
        if os.path.exists(jqfile):
            copyCore(jqfile, opts)
            break
    compile_info.is_compiling = True
    loadAppsFromPath(opts, opts.app_path)
    # how lets mark all changes
    FILE_CACHE.clearChanges()
    compile_info.is_compiling = False
    print("total compile time: {:.3f}".format(time.time() - started_at))


def loadAppsFromPath(opts, app_path, parent_folder=None):
    for name in os.listdir(app_path):
        path = os.path.join(app_path, name)
        if os.path.isdir(path):
            if parent_folder:
                name = F"{parent_folder}__{name}"
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
                else:
                    loadAppsFromPath(opts, path, name)
                    continue
            app_config = APPS.get(name, None)
            if app_config and not app_config.disable:
                app_started_at = time.time()
                buildApp(path, app_config, opts)
                print("\t{} compile time: {}".format(name, time.time() - app_started_at))


class FileWatcher():
    def __init__(self, opts, freq=1.0):
        self.opts = opts
        self.opts.auto_version = opts.auto_version
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

DEFAULT_HTML = """
<!doctype html>
<html class="with-statusbar-overlay">

<head>
    <style>
    body {
        background-color: #424242;
        color: white;
        font-family: sans-serif;
    }

    li.swam-path {
        color: #ff9800;
        margin-top: 16px;
    }

    li.swam-app {
        margin-top: 8px;
    }

    li.swam-app a {
        color: #007aff;
        text-decoration: none;
        transition: font-size 500ms ease-in-out;
    }

    li.swam-app a:hover {
        font-size: 25px;
        
    }

    li {
        font-size: 18px;
    }

    div.card {
        width: 500px;
        min-height: 60vh;
        margin: 50px auto;
        background: white;
        color: black;
        padding: 15px;
        border-radius: 4px;
    }
    </style>
</head>

<body>
    <div class="card">
        <h1 style="margin: 0;">Web Apps:</h1>
        <ul>
            {{apps}}
        </ul>
    </div>
</body>

</html>
"""

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
                app_path = name.replace("__", "/")
                path = urlparse(self.path).path
                ext = os.path.splitext(path)[1]
                if path[1:].startswith(app_path):
                    print(f"======\nname: {name}\napp_path: {app_path}\npath: {path}")
                    if ".html" in self.path:
                        self.path = "/apps" + self.path
                    elif not ext:
                        self.path = os.path.join(APP_PATHS[name], 'index.html')
                    else:
                        self.path = "/apps" + self.path
                    break
            full_path = os.path.join(opts.output, self.path)
            print(f"\npath: {self.path}\nfull_path: {full_path}")
            if not os.path.exists(full_path) and not ext:
                app_list = []
                apps = {}
                for name in APP_PATHS:
                    names = name.split("__")
                    a = apps
                    for n in names:
                        if n not in a:
                            a[n] = dict()
                        la = a
                        a = a[n]
                    la[n] = APP_PATHS[name][4:]

                def _buildList(data):
                    for k, v in data.items():
                        if isinstance(v, dict):
                            app_list.append(F"<li class='swam-path'>{k}</li>")
                            app_list.append("<ul>")
                            _buildList(v)
                            app_list.append("</ul>")
                        else:
                            app_list.append("<li class='swam-app'><a href='")
                            app_list.append(v)
                            app_list.append("'>" + k.title() + "</a></li>\n")
                _buildList(apps)
                self.path = "index.html"
                default_html = DEFAULT_HTML.replace("{{apps}}", "".join(app_list))
                with open(os.path.join(opts.output, self.path), "w") as f:
                    f.write(default_html)
            return super().do_GET()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", opts.port), Handler) as httpd:
        print("serving at port", opts.port)
        httpd.serve_forever()


def clearCache(opts):
    import shutil
    shutil.rmtree(opts.output)
    FILE_CACHE.clear()


def main(opts, args):
    print("== SWAM COMPILER {} ==".format(version))
    print(F"\tOutput: {opts.output}")
    compile_info.verbose = opts.verbose
    compile_info.branch = getGitBranch()
    opts.output = os.path.abspath(opts.output)
    opts.plugins = CONFIG.get("plugins", ["plugins"])
    print(F"\tAbsolute Output: {opts.output}")
    if not opts.force and (opts.bump_rev or opts.bump_major or opts.bump_minor):
        return bumpVersion(opts.bump_major, opts.bump_minor, opts.bump_rev)
    if opts.clear:
        clearCache(opts)
        sys.exit(1)
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

