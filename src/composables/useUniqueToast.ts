import type { ToastMessageOptions } from 'primevue/toast';
import type { ToastServiceMethods } from 'primevue/toastservice';

let toast: ToastServiceMethods;

interface ToastMessageOptionsWithId extends ToastMessageOptions {
	id?: number;
}

const openToasts: ToastMessageOptionsWithId[] = [];

export const useUniqueToast = (toastService: ToastServiceMethods) => {
	toast = toastService;

	function removeDuplicateToast(message: ToastMessageOptionsWithId) {
		const { summary, detail, severity, group } = message;
		const msgKey = JSON.stringify({ summary, detail, severity, group });
		const idx = openToasts.findIndex(message => {
			const { summary, detail, severity, group } = message;
			const msgKey2 = JSON.stringify({ summary, detail, severity, group });
			return msgKey === msgKey2;
		});
		if (idx != -1) {
			toast.remove(openToasts[idx]);
			openToasts.splice(idx, 1);
		}
	}

	function removeById(id: number) {
		const idx = openToasts.findIndex(msg => msg.id === id);
		if (idx != -1) {
			openToasts.splice(idx, 1);
		}
	}

	function addToast(message: ToastMessageOptionsWithId) {
		openToasts.push(message);
		toast.add(message);
	}

	function add(message: ToastMessageOptionsWithId): void {
		removeDuplicateToast(message);
		addToast(message);

		if (message.life) {
			setTimeout(() => {
				onClose(message);
			}, message.life);
		}
	}

	function onClose(message: any) {
		removeById(message.id);
	}

	return { add, onClose };
};
