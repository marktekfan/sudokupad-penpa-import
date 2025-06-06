import './style.css';
import './flex-ml.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

//import { createRouter, createWebHistory } from 'vue-router';
//import { routes } from '@/router';

{
	// import AutoComplete from 'primevue/autocomplete';
	// import Accordion from 'primevue/accordion';
	// import AccordionTab from 'primevue/accordiontab';
	// import AnimateOnScroll from 'primevue/animateonscroll';
	// import Avatar from 'primevue/avatar';
	// import AvatarGroup from 'primevue/avatargroup';
	// import Badge from 'primevue/badge';
	// import BadgeDirective from "primevue/badgedirective";
	// import BlockUI from 'primevue/blockui';
	// import Breadcrumb from 'primevue/breadcrumb';
	// import Calendar from 'primevue/calendar';
	// import Card from 'primevue/card';
	// import CascadeSelect from 'primevue/cascadeselect';
	// import Carousel from 'primevue/carousel';
	// import Chip from 'primevue/chip';
	// import Chips from 'primevue/chips';
	// import ColorPicker from 'primevue/colorpicker';
	// import Column from 'primevue/column';
	// import ColumnGroup from 'primevue/columngroup';
	// import ConfirmDialog from 'primevue/confirmdialog';
	// import ConfirmPopup from 'primevue/confirmpopup';
	// import ConfirmationService from 'primevue/confirmationservice';
	// import ContextMenu from 'primevue/contextmenu';
	// import DataTable from 'primevue/datatable';
	// import DataView from 'primevue/dataview';
	// import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
	// import DeferredContent from 'primevue/deferredcontent';
	// import Dialog from 'primevue/dialog';
	// import DialogService from 'primevue/dialogservice'
	// import Divider from 'primevue/divider';
	// import Dock from 'primevue/dock';
	// import DynamicDialog from 'primevue/dynamicdialog';
	// import FileUpload from 'primevue/fileupload';
	// import FocusTrap from 'primevue/focustrap';
	// import Galleria from 'primevue/galleria';
	// import Image from 'primevue/image';
	// import InlineMessage from 'primevue/inlinemessage';
	// import Inplace from 'primevue/inplace';
	// import InputGroup from 'primevue/inputgroup';
	// import InputGroupAddon from 'primevue/inputgroupaddon';
	// import InputMask from 'primevue/inputmask';
	// import InputNumber from 'primevue/inputnumber';
	// import Knob from 'primevue/knob';
	// import Listbox from 'primevue/listbox';
	// import MegaMenu from 'primevue/megamenu';
	// import Menubar from 'primevue/menubar';
	// import MultiSelect from 'primevue/multiselect';
	// import OrderList from 'primevue/orderlist';
	// import OrganizationChart from 'primevue/organizationchart';
	// import OverlayPanel from 'primevue/overlaypanel';
	// import Paginator from 'primevue/paginator';
	// import Panel from 'primevue/panel';
	// import PanelMenu from 'primevue/panelmenu';
	// import Password from 'primevue/password';
	// import PickList from 'primevue/picklist';
	// import ProgressBar from 'primevue/progressbar';
	// import ProgressSpinner from 'primevue/progressspinner';
	// import Rating from 'primevue/rating';
	// import RadioButton from 'primevue/radiobutton';
	// import Row from 'primevue/row';
	// import SelectButton from 'primevue/selectbutton';
	// import ScrollPanel from 'primevue/scrollpanel';
	// import ScrollTop from 'primevue/scrolltop';
	// import Skeleton from 'primevue/skeleton';
	// import Slider from 'primevue/slider';
	// import SpeedDial from 'primevue/speeddial';
	// import Splitter from 'primevue/splitter';
	// import SplitterPanel from 'primevue/splitterpanel';
	// import Steps from 'primevue/steps';
	// import TabMenu from 'primevue/tabmenu';
	// import TieredMenu from 'primevue/tieredmenu';
	// import TabView from 'primevue/tabview';
	// import TabPanel from 'primevue/tabpanel';
	// import Tag from 'primevue/tag';
	// import Terminal from 'primevue/terminal';
	// import Timeline from 'primevue/timeline';
	// import ToggleButton from 'primevue/togglebutton';
	// import Tree from 'primevue/tree';
	// import TreeSelect from 'primevue/treeselect';
	// import TreeTable from 'primevue/treetable';
	// import TriStateCheckbox from 'primevue/tristatecheckbox';
	// import VirtualScroller from 'primevue/virtualscroller';
	// import Ripple from 'primevue/ripple';
	// import StyleClass from 'primevue/styleclass';
	// import ThemeSwitcher from './components/ThemeSwitcher.vue';
	// import Configurator from './components/Configurator.vue';
	// import Lara from './presets/lara';
	// import Wind from './presets/wind';
	// import appState from './plugins/appState.js';
	// app.use(ConfirmationService);
	// app.use(DialogService);
	// app.use(router);
	// app.directive('badge', BadgeDirective);
	// app.directive('ripple', Ripple);
	// app.directive('styleclass', StyleClass);
	// app.directive('focustrap', FocusTrap);
	// app.directive('animateonscroll', AnimateOnScroll);
	// app.component('Accordion', Accordion);
	// app.component('AccordionTab', AccordionTab);
	// app.component('AutoComplete', AutoComplete);
	// app.component('Avatar', Avatar);
	// app.component('AvatarGroup', AvatarGroup);
	// app.component('Badge', Badge);
	// app.component('BlockUI', BlockUI);
	// app.component('Breadcrumb', Breadcrumb);
	// app.component('Calendar', Calendar);
	// app.component('Card', Card);
	// app.component('Carousel', Carousel);
	// app.component('CascadeSelect', CascadeSelect);
	// app.component('Chip', Chip);
	// app.component('Chips', Chips);
	// app.component('ColorPicker', ColorPicker);
	// app.component('Column', Column);
	// app.component('ColumnGroup', ColumnGroup);
	// app.component('ConfirmDialog', ConfirmDialog);
	// app.component('ConfirmPopup', ConfirmPopup);
	// app.component('ContextMenu', ContextMenu);
	// app.component('DataTable', DataTable);
	// app.component('DataView', DataView);
	// app.component('DataViewLayoutOptions', DataViewLayoutOptions);
	// app.component('DeferredContent', DeferredContent);
	// app.component('Dialog', Dialog);
	// app.component('Divider', Divider);
	// app.component('Dock', Dock);
	// app.component('DynamicDialog', DynamicDialog);
	// app.component('FileUpload', FileUpload);
	// app.component('Galleria', Galleria);
	// app.component('Image', Image);
	// app.component('InlineMessage', InlineMessage);
	// app.component('Inplace', Inplace);
	// app.component('InputGroup', InputGroup);
	// app.component('InputGroupAddon', InputGroupAddon);
	// app.component('InputMask', InputMask);
	// app.component('InputNumber', InputNumber);
	// app.component('Knob', Knob);
	// app.component('Listbox', Listbox);
	// app.component('MegaMenu', MegaMenu);
	// app.component('Menubar', Menubar);
	// app.component('MultiSelect', MultiSelect);
	// app.component('OrderList', OrderList);
	// app.component('OrganizationChart', OrganizationChart);
	// app.component('OverlayPanel', OverlayPanel);
	// app.component('Paginator', Paginator);
	// app.component('Panel', Panel);
	// app.component('PanelMenu', PanelMenu);
	// app.component('Password', Password);
	// app.component('PickList', PickList);
	// app.component('ProgressBar', ProgressBar);
	// app.component('ProgressSpinner', ProgressSpinner);
	// app.component('RadioButton', RadioButton);
	// app.component('Rating', Rating);
	// app.component('Row', Row);
	// app.component('SelectButton', SelectButton);
	// app.component('ScrollPanel', ScrollPanel);
	// app.component('ScrollTop', ScrollTop);
	// app.component('Slider', Slider);
	// app.component('Skeleton', Skeleton);
	// app.component('SpeedDial', SpeedDial);
	// app.component('Splitter', Splitter);
	// app.component('SplitterPanel', SplitterPanel);
	// app.component('Steps', Steps);
	// app.component('TabMenu', TabMenu);
	// app.component('TabView', TabView);
	// app.component('TabPanel', TabPanel);
	// app.component('Tag', Tag);
	// app.component('Terminal', Terminal);
	// app.component('TieredMenu', TieredMenu);
	// app.component('Timeline', Timeline);
	// app.component('ToggleButton', ToggleButton);
	// app.component('Tree', Tree);
	// app.component('TreeSelect', TreeSelect);
	// app.component('TreeTable', TreeTable);
	// app.component('TriStateCheckbox', TriStateCheckbox);
	// app.component('VirtualScroller', VirtualScroller);
	// app.component('ThemeSwitcher', ThemeSwitcher);q
	// app.component('Configurator', Configurator);
}

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

// PrimeVue
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import Fieldset from 'primevue/fieldset';
import ToggleSwitch from 'primevue/toggleswitch';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import Drawer from 'primevue/drawer';
import SplitButton from 'primevue/splitbutton';
import Textarea from 'primevue/textarea';
import Toolbar from 'primevue/toolbar';
import Toast from 'primevue/toast';
import Tooltip from 'primevue/tooltip';
import Dialog from 'primevue/dialog';

import ToastService from 'primevue/toastservice';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import { updatePrimaryPalette, palette } from '@primevue/themes';

app.use(PrimeVue, {
	// Default theme configuration
	theme: {
		preset: Aura,
		options: {
			prefix: 'p',
			darkModeSelector: '.my-app-dark',
			cssLayer: false,
		},
	},
});

updatePrimaryPalette(palette('{amber}'));

app.use(ToastService);

// app.use(AppInstance);
// const router = createRouter({
// 	routes,
// 	//history: createWebHashHistory('/sudokupad-penpa-import/'),
// 	history: createWebHistory('/sudokupad-penpa-import/'),
// });

// app.use(router);

app.directive('tooltip', Tooltip);
app.component('Button', Button);
app.component('Checkbox', Checkbox);
app.component('Select', Select);
app.component('Fieldset', Fieldset);
app.component('ToggleSwitch', ToggleSwitch);
app.component('InputText', InputText);
app.component('Menu', Menu);
app.component('Drawer', Drawer);
app.component('SplitButton', SplitButton);
app.component('Textarea', Textarea);
app.component('Toast', Toast);
app.component('Toolbar', Toolbar);
app.component('Dialog', Dialog);

app.mount('#app');
