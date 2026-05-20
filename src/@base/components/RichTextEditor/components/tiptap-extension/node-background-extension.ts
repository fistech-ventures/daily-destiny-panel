import { getSelectedNodesOfType, updateNodesAttr } from '@base/components/RichTextEditor/lib/tiptap-utils';
import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nodeBackground: {
      setNodeBackgroundColor: (color: string) => ReturnType;
      unsetNodeBackgroundColor: () => ReturnType;
      toggleNodeBackgroundColor: (color: string) => ReturnType;
    };
  }
}

const SUPPORTED_NODE_TYPES = ['paragraph', 'heading', 'blockquote', 'listItem', 'taskItem'];
const ATTR_NAME = 'backgroundColor';

export const NodeBackground = Extension.create({
  name: 'nodeBackground',

  addGlobalAttributes() {
    return [
      {
        types: SUPPORTED_NODE_TYPES,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-bg-color') || element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) return {};
              return {
                'data-bg-color': attributes.backgroundColor,
                style: `background-color: ${attributes.backgroundColor};`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setNodeBackgroundColor:
        (color: string) =>
        ({ tr, state, dispatch }) => {
          const targets = getSelectedNodesOfType(state.selection, SUPPORTED_NODE_TYPES);
          if (!targets.length) return false;

          const changed = updateNodesAttr<string, string | null>(tr, targets, ATTR_NAME, color || null);
          if (!changed) return false;

          if (dispatch) dispatch(tr);
          return true;
        },

      unsetNodeBackgroundColor:
        () =>
        ({ tr, state, dispatch }) => {
          const targets = getSelectedNodesOfType(state.selection, SUPPORTED_NODE_TYPES);
          if (!targets.length) return false;

          const changed = updateNodesAttr<string, string | null>(tr, targets, ATTR_NAME, null);
          if (!changed) return false;

          if (dispatch) dispatch(tr);
          return true;
        },

      toggleNodeBackgroundColor:
        (color: string) =>
        ({ tr, state, dispatch }) => {
          const targets = getSelectedNodesOfType(state.selection, SUPPORTED_NODE_TYPES);
          if (!targets.length) return false;

          const changed = updateNodesAttr<string, string | null>(tr, targets, ATTR_NAME, (prev) =>
            prev === color ? null : color,
          );
          if (!changed) return false;

          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
});
