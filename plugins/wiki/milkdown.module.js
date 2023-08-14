import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';

window.Editor = Editor
  .make()
  .use(commonmark)
  .use(tooltip)
  .use(slash)
  .create();
