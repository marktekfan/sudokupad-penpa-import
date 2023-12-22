// Stub to capture messages
export const Swal = {
	handler: (opts: any) => {
		console.log(opts);
	},
	fire: function (opts: any) {
		this.handler(opts);
	},
};
