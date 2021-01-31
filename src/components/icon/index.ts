import Icon from './Icon.vue';

const req = require.context('@/assets/icons', false, /\.svg$/i);
const requireAll = (requireContext: any) =>
  requireContext.keys().map(requireContext);
requireAll(req);

export { Icon };
