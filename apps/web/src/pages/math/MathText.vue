<script lang="ts">
import { defineComponent, h, type VNode } from 'vue';

export default defineComponent({
  props: { text: { type: String, required: true } },
  setup(props) {
    return () => {
      const normalized = props.text.replace(/\*\*/g, '^').replace(/\*/g, '×');
      const regex = /\^([a-zA-Z0-9]+|\([^)]+\))/g;
      const children: (string | VNode)[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(normalized)) !== null) {
        if (match.index > lastIndex) children.push(normalized.slice(lastIndex, match.index));
        children.push(h('sup', match[1].replace(/^\(|\)$/g, '')));
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < normalized.length) children.push(normalized.slice(lastIndex));
      return h('span', { class: 'math-text' }, children);
    };
  },
});
</script>
