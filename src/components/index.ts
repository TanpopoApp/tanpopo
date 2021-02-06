import Vue from 'vue';

import { Button } from '@/components/button';

import { Form, FormItem } from '@/components/form';

import { Icon } from '@/components/icon';

import { Input } from '@/components/input';

import { Menu, MenuItem } from '@/components/menu';

import Modal from '@/components/modal/Modal.vue';

import { Radio, RadioGroup } from '@/components/radio';

import { Select, Option } from '@/components/select';

import { TanSwitch } from '@/components/switch';

Vue.component('Button', Button);

Vue.component('Form', Form);
Vue.component('FormItem', FormItem);

Vue.component('Icon', Icon);

Vue.component('TanInput', Input);

Vue.component('Menu', Menu);
Vue.component('MenuItem', MenuItem);

Vue.component('Modal', Modal);

Vue.component('Radio', Radio);
Vue.component('RadioGroup', RadioGroup);

Vue.component('Select', Select);
Vue.component('Option', Option);

Vue.component('TanSwitch', TanSwitch);
