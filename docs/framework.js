const Framework = (() => {

	function Framework() {}
	const F = Framework, P = Object.assign(F.prototype, {constructor: F});
	PortableEvents.mixin(F);
	F.SettingsKey = 'settings';
	F.icons = {
		toolNormal: `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><g transform="translate(7.75 17.5) scale(0.0075 -0.0075)"><path d="M832 877q0 152 -28 247.5t-77 147.5q-44 48 -89 66t-99 18q-123 0 -196 -88t-73 -255q0 -94 24 -155t78 -105q38 -31 86 -41.5t103 -10.5q64 0 138 22.5t129 59.5q1 15 2.5 39.5t1.5 54.5zM67 1005q0 115 37.5 210t102.5 164q62 66 151.5 103t181.5 37q103 0 186.5 -34.5 t144.5 -99.5q77 -82 119.5 -215t42.5 -336q0 -185 -41.5 -350.5t-122.5 -274.5q-86 -116 -206.5 -177t-297.5 -61q-40 0 -85 4.5t-84 16.5v191h10q25 -14 78 -27t108 -13q196 0 308 129t127 369q-80 -54 -152.5 -79t-157.5 -25q-83 0 -151 18t-137 70q-80 61 -121 154.5 t-41 225.5z" /></g></svg>`,
		toolCorner: `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path transform="translate(6.2 11.2) scale(0.0035 -0.0035)" d="M1179 0h-984v260h314v787h-314v243q69 0 137 9t109 29q48 24 74.5 64.5t30.5 100.5h326v-1233h307v-260z" /><path transform="translate(13.2 11.2) scale(0.0035 -0.0035)" d="M1245 0h-1094v243q139 110 249.5 208t194.5 186q109 115 158 202t49 179q0 104 -62 159.5t-173 55.5q-57 0 -107.5 -14t-102.5 -36q-51 -23 -87 -47l-54 -36h-29v325q63 30 197 61.5t258 31.5q265 0 401.5 -118t136.5 -332q0 -132 -62 -258.5t-206 -271.5 q-90 -89 -175 -158.5t-123 -98.5h631v-281z" /><path transform="translate(6.2 18) scale(0.0035 -0.0035)" d="M1208 451q0 -109 -40.5 -199t-118.5 -153q-79 -63 -185.5 -96.5t-259.5 -33.5q-174 0 -298.5 29t-202.5 65v323h36q82 -52 192.5 -90t201.5 -38q54 0 117.5 9.5t106.5 41.5q34 25 54.5 61.5t20.5 103.5q0 66 -29 101.5t-77 51.5q-48 17 -115 19t-118 2h-64v262h59 q68 0 125 6t97 24q40 19 62.5 53t22.5 92q0 45 -21 73.5t-52 44.5q-36 18 -84 24t-82 6q-55 0 -112 -13t-111 -33q-42 -16 -88 -41.5t-68 -38.5h-31v319q77 33 207.5 63.5t266.5 30.5q133 0 230.5 -23t166.5 -67q76 -47 114 -119.5t38 -163.5q0 -127 -73.5 -222.5 t-193.5 -123.5v-14q53 -8 103.5 -27t98.5 -62q45 -39 74.5 -100.5t29.5 -146.5z" /></svg>`,
		toolCenter: `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path transform="translate(7.6, 14.5) scale(0.0035 -0.0035)" d="M1179 0h-984v260h314v787h-314v243q69 0 137 9t109 29q48 24 74.5 64.5t30.5 100.5h326v-1233h307v-260z" /><path transform="translate(11.6, 14.5) scale(0.0035 -0.0035)" d="M1245 0h-1094v243q139 110 249.5 208t194.5 186q109 115 158 202t49 179q0 104 -62 159.5t-173 55.5q-57 0 -107.5 -14t-102.5 -36q-51 -23 -87 -47l-54 -36h-29v325q63 30 197 61.5t258 31.5q265 0 401.5 -118t136.5 -332q0 -132 -62 -258.5t-206 -271.5 q-90 -89 -175 -158.5t-123 -98.5h631v-281z" /></svg>`,
		toolColour: `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><g stroke="#0003" stroke-width=".3"><path d="m12 12 3.36-7.2h3.84v3.84l-7.2 3.36" fill="#e6e6e6"/><path d="m12 12 7.2-3.36v5.29l-7.2-1.93" fill="#b0b0b0"/><path d="m12 12 7.2 1.93v5.27h-2.16l-5.04-7.2" fill="#505050"/><path d="m12 12 5.04 7.2h-5.67l0.63-7.2" fill="#d1efa5"/><path d="m12 12-0.63 7.2h-6.57l7.2-7.2" fill="#f1b0f6"/><path d="m12 12-7.2 7.2v-6.57l7.2-0.63" fill="#f3b48f"/><path d="m12 12-7.2 0.63v-5.67l7.2 5.04" fill="#f39390"/><path d="m12 12-7.2-5.04v-2.16h5.27l1.93 7.2" fill="#fae799"/><path d="m12 12-1.93-7.2h5.29l-3.36 7.2" fill="#8ac1f9"/></g><path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`,
		toolSelect: `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8.5 8.5h-5.2v-4.2c0-.55.45-1 1-1h4.2v5.2zM3.3 9.3h5.2v5.2h-5.2v-5.2zM8.5 20.5h-4.2c-.55 0-1-.45-1-1v-4.2h5.2v5.2zM9.3 3.3h5.2v5.2h-5.2v-5.2zM9.3 9.3h5.2v5.2h-5.2v-5.2zM9.3 15.3h5.2v5.2h-5.2v-5.2zM20.5 8.5h-5.2v-5.2h4.2c.55 0 1 .45 1 1v4.2zM15.3 9.3h5.2v5.2h-5.2v-5.2zM19.5 20.5h-4.2v-5.2h5.2v4.2c0 .55-.45 1-1 1z"/><path transform="translate(2.9, 2.9) scale(0.0935)" fill="rgba(255, 215, 0, 0.5)" stroke="rgba(0, 126, 255, 1)" stroke-width="15" stroke-linecap="butt" stroke-linejoin="round" d="M138 10L182 10L182 118L138 118 ZM10 74L54 74L54 118L10 118 ZM74 138L118 138L118 182L74 182 Z"></path></svg>`,
		back: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.88,2.88L16.88,2.88c-0.49-0.49-1.28-0.49-1.77,0l-8.41,8.41c-0.39,0.39-0.39,1.02,0,1.41l8.41,8.41 c0.49,0.49,1.28,0.49,1.77,0l0,0c0.49-0.49,0.49-1.28,0-1.77L9.54,12l7.35-7.35C17.37,4.16,17.37,3.37,16.88,2.88z"/></svg>',
		forward: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M7.38 21.01c.49.49 1.28.49 1.77 0l8.31-8.31c.39-.39.39-1.02 0-1.41L9.15 2.98c-.49-.49-1.28-.49-1.77 0s-.49 1.28 0 1.77L14.62 12l-7.25 7.25c-.48.48-.48 1.28.01 1.76z"/></svg>',
		settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="25" height="25"><path fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"></path></svg>',
		undo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L3.71 8.71C3.08 8.08 2 8.52 2 9.41V15c0 .55.45 1 1 1h5.59c.89 0 1.34-1.08.71-1.71l-1.91-1.91c1.39-1.16 3.16-1.88 5.12-1.88 3.16 0 5.89 1.84 7.19 4.5.27.56.91.84 1.5.64.71-.23 1.07-1.04.75-1.72C20.23 10.42 16.65 8 12.5 8z"/></svg>',
		redo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.16 0-7.74 2.42-9.44 5.93-.32.67.04 1.47.75 1.71.59.2 1.23-.08 1.5-.64 1.3-2.66 4.03-4.5 7.19-4.5 1.95 0 3.73.72 5.12 1.88l-1.91 1.91c-.63.63-.19 1.71.7 1.71H21c.55 0 1-.45 1-1V9.41c0-.89-1.08-1.34-1.71-.71l-1.89 1.9z"/></svg>',
		restart: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><mask id="cutout"><rect width="100%" height="100%" fill="#fff"/><path d="M12 9c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1V10c0-.55.45-1 1-1zM12 21zm1-3h-2v-2h2v2z" stroke-width="1.5" stroke="#000" fill="#000"/></mask><path mask="url(#cutout)" d="M12 5V2.21c0-.45-.54-.67-.85-.35l-3.8 3.79c-.2.2-.2.51 0 .71l3.79 3.79c.32.31.86.09.86-.36V7c3.73 0 6.68 3.42 5.86 7.29-.47 2.27-2.31 4.1-4.57 4.57-3.57.75-6.75-1.7-7.23-5.01-.07-.48-.49-.85-.98-.85-.6 0-1.08.53-1 1.13.62 4.39 4.8 7.64 9.53 6.72 3.12-.61 5.63-3.12 6.24-6.24C20.84 9.48 16.94 5 12 5z"/><path d="M12 9c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1V10c0-.55.45-1 1-1zM12 21zm1-3h-2v-2h2v2z"/></svg>',
		check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z"/></svg>',
		rules: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm1 14H8c-.55 0-1-.45-1-1s.45-1 1-1h5c.55 0 1 .45 1 1s-.45 1-1 1zm3-4H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>',
		info: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm1.61-9.96c-2.06-.3-3.88.97-4.43 2.79-.18.58.26 1.17.87 1.17h.2c.41 0 .74-.29.88-.67.32-.89 1.27-1.5 2.3-1.28.95.2 1.65 1.13 1.57 2.1-.1 1.34-1.62 1.63-2.45 2.88 0 .01-.01.01-.01.02-.01.02-.02.03-.03.05-.09.15-.18.32-.25.5-.01.03-.03.05-.04.08-.01.02-.01.04-.02.07-.12.34-.2.75-.2 1.25h2c0-.42.11-.77.28-1.07.02-.03.03-.06.05-.09.08-.14.18-.27.28-.39.01-.01.02-.03.03-.04.1-.12.21-.23.33-.34.96-.91 2.26-1.65 1.99-3.56-.24-1.74-1.61-3.21-3.35-3.47z"/></svg>',
		fullscreenOn: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 14c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1H7v-2c0-.55-.45-1-1-1zm0-4c.55 0 1-.45 1-1V7h2c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm11 7h-2c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1s-1 .45-1 1v2zM14 6c0 .55.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V6c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1z"/></svg>',
		fullscreenOff: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 16h2v2c0 .55.45 1 1 1s1-.45 1-1v-3c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1zm2-8H6c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1s-1 .45-1 1v2zm7 11c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-3c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm1-11V6c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1h-2z"/></svg>',
		youtube: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.4 85" width="35" height="25"><path fill="currentColor" d="M 118.9,13.3 C 117.5,8.1 113.4,4 108.2,2.6 98.7,0 60.7,0 60.7,0 60.7,0 22.7,0 13.2,2.5 8.1,3.9 3.9,8.1 2.5,13.3 0,22.8 0,42.5 0,42.5 0,42.5 0,62.3 2.5,71.7 3.9,76.9 8,81 13.2,82.4 22.8,85 60.7,85 60.7,85 c 0,0 38,0 47.5,-2.5 5.2,-1.4 9.3,-5.5 10.7,-10.7 2.5,-9.5 2.5,-29.2 2.5,-29.2 0,0 0.1,-19.8 -2.5,-29.3 z"/><polygon points="80.2,42.5 48.6,24.3 48.6,60.7" style="fill:#ffffff"/></svg>',
		patreon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 180 180"><path fill="#f96753" d="M109 26a48 48 0 1 0 0 96 48 48 0 0 0 0-96"/><path fill="#052a49" d="M23 154V26h24v128z"/></svg>',
		copy: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 20H5V7c0-.55-.45-1-1-1s-1 .45-1 1v13c0 1.1.9 2 2 2h10c.55 0 1-.45 1-1s-.45-1-1-1zm5-4V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2zm-2 0H9V4h9v12z"/></svg>',
		edit: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
	};
	F.html = {
		dialogsupportlinks: {class: 'supportlinks', innerHTML: `<p>Support this app:<br/><a href="https://youtube.svencodes.com">Youtube <span class="icon" style="color: #c00; vertical-align: middle">${Framework.icons.youtube}</span></a> / <a href="https://patreon.svencodes.com/">Patreon <span class="icon" style="vertical-align: middle;"">${Framework.icons.patreon}</span></a></p>`, style: 'font-size: 0.8rem; padding: 0 1rem; text-align: center; margin: 2rem 0;'},
	};
	F.LocalDataPrefix = 'svencodes';
	F.saveSettingsMinDelay = 500;
	F.saveSettingsMaxDelay = 2000;
	// Utility
		F.isHTMLElement = function(elem) {
			return typeof elem === 'object' && elem.nodeType === 1;
		};
	// Storage
		F.setData = function(name, val) {
			let dataKey = F.LocalDataPrefix + '_' + name;
			if(val !== null && typeof val === 'object') val = JSON.stringify(val);
			return localStorage.setItem(dataKey, val);
		};
		F.getData = function(name) {
			let dataKey = F.LocalDataPrefix + '_' + name;
			let res = localStorage.getItem(dataKey);
			try { res = JSON.parse(res); } catch(err) {}
			return res;
		};
		F.removeData = function(name) {
			let dataKey = F.LocalDataPrefix + '_' + name;
			return localStorage.removeItem(dataKey);
		};
		F.updateLegacyData = function(keys = []) {
			keys.forEach(key => {
				let val = localStorage.getItem(key);
				if(val === null) return;
				F.setData(key, val);
				localStorage.removeItem(key);
			});
		};
	// App
		F.getApp = () => new Promise((resolve, reject) => {
			if(typeof F.app !== 'undefined') return resolve(F.app);
			let timeoutId, intervalId;
			intervalId = setInterval(() => {
				if(typeof F.app !== 'undefined') {
					clearTimeout(timeoutId);
					clearInterval(intervalId);
					return resolve(F.app);
				}
			}, 50);
			timeoutId = setTimeout(() => {
				clearTimeout(timeoutId);
				clearInterval(intervalId);
				reject(new Error('Timed out waiting for app to load (5000ms)'));
			}, 5000);
		});
	// Dialog
		F.ExtraProps = ['tag', 'parent', 'children', 'handler', 'label', 'action', 'class', 'content', 'attributes', 'dataset', 'options'];
		F.tagAliases = {
			title: 'h1',
			text: 'p'
		};
		F.handleButton = event => {
			const {onButton, autoClose} = F.dialogOpts;
			if(event) {
				event.stopPropagation();
				event.preventDefault();
				event.stopImmediatePropagation();
			}
			if(typeof onButton === 'function') onButton(event.target.textContent);
			if(autoClose !== false) F.closeDialog();
		};
		F.handleDialogCancel = event => {
			if(event) {
				event.stopPropagation();
				event.stopImmediatePropagation();
			}
			if(event.eventPhase === 2) {
				event.preventDefault();
				const {onCancel} = F.dialogOpts;
				F.closeDialog();
				if(typeof onCancel === 'function') onCancel();
			}
			return false;
		};
		F.dialogOptionButtons = (opts = {}) => {
			const {options, handler, parent} = opts;
			let optionsElem = F.createElem({tag: 'div', className: 'dialog-options', parent});
			options.forEach((opts = {}) => {
				if(typeof opts === 'string') opts = {content: opts};
				F.createElem(Object.assign(opts, {tag: 'button', parent: optionsElem, handler: F.handleButton}));
			});
			return optionsElem;
		};
		F.createElem = opts => {
			// Handle native DOM element
			if(F.isHTMLElement(opts)) return opts;
			if(opts === null) return;
			opts = Object.assign({}, opts);
			Object.keys(opts).forEach(key => opts[key] === undefined ? delete opts[key] : null);
			const extra = F.ExtraProps.reduce((o, p) => {
				if(opts[p] !== undefined) o[p] = opts[p];
				delete opts[p];
				return o;
			}, {});
			let {tag = 'div', parent, handler, action} = extra;
			if(extra.class) opts.className = extra.class;
			if(extra.content) opts.textContent = extra.content;
			if(F.tagAliases[tag]) tag = F.tagAliases[tag];
			if(extra.label) {
				parent = F.createElem({tag: 'label', parent, title: extra.label, textContent: extra.label});
			}
			let elem = opts.elem;
			if(elem === undefined) {
				let labelOpts;
				switch(tag) {
					case 'toggle':
						labelOpts = {
							tag: 'label', title: opts.title, attributes: {for: opts.name},
							textContent: opts.textContent, innerHTML: opts.innerHTML
						};
						let toggleOpts = Object.assign(
							{tag: 'input', type: 'checkbox',
								id: opts.name,
								checked: opts.value === true || undefined,
								title: extra.content || opts.title,
								className: 'setting-toggle'
							},
							opts,
							{value: undefined, textContent: undefined, innerHTML: undefined}
						);
						parent = F.createElem({parent, className: 'setting-item setting-toggle', children: [toggleOpts, labelOpts]});
						elem = parent.children[0];
						if(typeof handler === 'function') {
							elem.addEventListener('change', handler, {passive: false});
						}
						handler = parent = undefined;
						break;
					case 'multi':
						labelOpts = {
							tag: 'label', title: opts.title, attributes: {for: opts.name},
							textContent: opts.textContent, innerHTML: opts.innerHTML
						};
						let multiOpts = Object.assign(
							{
								tag: 'select',
								value: opts.value,
								className: 'setting-multi',
								children: extra.options.map(opts => Object.assign({tag: 'option'}, opts))
							},
							opts,
							{value: undefined, textContent: undefined, innerHTML: undefined}
						);
						parent = F.createElem({parent, className: 'setting-item setting-multi', children: [labelOpts, multiOpts]});
						elem = parent.children[1];
						elem.value = opts.value;
						if(typeof handler === 'function') {
							elem.addEventListener('change', handler, {passive: false});
						}
						handler = parent = undefined;
						break;
					case 'options':
						let elemOpts = {
							tag: 'div', parent,
							className: 'dialog-options' + (opts.className ? ` ${opts.className}` : '')
						};
						if(opts.style) elemOpts.style = opts.style;
						elem = F.createElem(elemOpts);
						extra.options.forEach((opts = {}) => {
							if(typeof opts === 'string') opts = {content: opts};
							F.createElem(Object.assign(opts, {tag: 'button', parent: elem, handler: opts.handler || F.handleButton}));
						});
						break;
					default: elem = Object.assign(document.createElement(tag), opts);
				}
				if(typeof opts.onclick === 'function') elem.onclick = opts.onclick;
			}
			else {
				Object.assign(elem, opts);
			}
			if(extra.attributes) Object.keys(extra.attributes).forEach(key => elem.setAttribute(key, extra.attributes[key]));
			if(extra.dataset) Object.keys(extra.dataset).forEach(key => elem.dataset[key] = extra.dataset[key]);
			if(typeof parent === 'string') parent = document.querySelector(parent);
			if(parent) parent.appendChild(elem);
			if(action === 'close' && handler === undefined) handler = F.closeDialog;
			if(typeof handler === 'function') addDownEventHandler(elem, handler, {passive: false});
			if(Array.isArray(extra.children)) {
				extra.children.forEach(child => F.isHTMLElement(child)
					? elem.appendChild(child)
					: F.createElem(Object.assign({parent: elem}, child))
				);
			}
			return elem;
		};
		F.centerDialogOverBoard = () => {
			document.querySelector('.dialog-overlay').classList.add('centeroverboard');
		};
		F.handleKeyDown = event => {
			const cancelDialog = () => {
				const {onCancel} = F.dialogOpts;
				F.closeDialog();
				if(typeof onCancel === 'function') onCancel();
			};
			switch(event.code) {
				case 'Escape': cancelDialog(); break;
				case 'Space':
				case 'Enter':
				case 'NumpadEnter':
					let partOptions = F.dialogOpts.parts.find(part => part.tag === 'options');
					if(partOptions.options.length === 1) cancelDialog();
					break;
			}
		};
		F.showDialog = (opts = {}) => {
			if(document.querySelectorAll('.dialog-overlay').length > 0) {
				return ;//console.warn('F.showDialog > Dialog already visible!');
			}
			F.dialogOpts = opts;
			let overlayElem, dialogElem;
			overlayElem = F.createElem({className: `dialog-overlay ${opts.overlayClass || ''}`});
			addDownEventHandler(overlayElem, F.handleDialogCancel, {passive: false});
			document.addEventListener('keydown', F.handleKeyDown, {passive: false});
			dialogElem = F.createElem({className: `dialog ${opts.dialogClass || ''}`, style: opts.style, parent: overlayElem});
			(opts.parts || [])
				.map(opts => F.createElem(Object.assign({parent: dialogElem}, opts)));
			document.body.appendChild(overlayElem);
			if(opts.overlayBlur) document.body.classList.add('overlay-visible');
			if(F.app) F.app.pauseInteractionHandlers();
			if(opts.centerOverBoard) F.centerDialogOverBoard();
			addHandler(window, 'resize', F.handleResize);
			F.handleResize();
		};
		F.closeDialog = event => {
			if(event) {
				event.stopPropagation();
				event.preventDefault();
				event.stopImmediatePropagation();
			}
			document.removeEventListener('keydown', F.handleKeyDown, {passive: false});
			let overlayElem = document.querySelector('.dialog-overlay');
			if(overlayElem === null) return;
			removeDownEventHandler(overlayElem, F.handleDialogCancel, {passive: false});
			document.body.classList.remove('overlay-visible');
			overlayElem.remove();
			// TODO: Clean up event handlers
			F.trigger('closedialog', F.dialogOpts);
			delete F.dialogOpts;
			if(F.app) F.app.unpauseInteractionHandlers();
			remHandler(window, 'resize', F.handleResize);
		};
		F.showAlert = (message, label = 'OK') => F.showDialog({parts: [
			{tag: 'text', content: message},
			{tag: 'options', options: [{tag: 'button', content: label, action: 'close'}]}
		]});
	// Buttons
		F.hasControlButton = name => {
			if(typeof name !== 'string' && (name || {}).name) name = name.name;
			return document.querySelectorAll(`#controls button[data-control="${name}"]`).length > 0;
		};
		F.addControlButton = (opts = {}) => {
			if(F.hasControlButton(opts)) return;// console.warn('F.addControlButton > button "%s" already exists.', opts.name);
			let btnElem = F.createElem({
				tag: 'button',
				id: `control-${opts.name}`,
				title: opts.title,
				innerHTML: opts.content,
				dataset: {control: opts.name},
				parent: opts.parent
			});
			return F.getApp()
				.then(app => {
					if(typeof opts.init === 'function') opts.init(app);
					if(typeof opts.onClick === 'function') {
						F.app.off(`control-${opts.name}`);
						F.app.on(`control-${opts.name}`, opts.onClick);
					}
					return btnElem;
				});
		};
		F.addButtons = (btns = []) => btns.forEach(F.addControlButton);
		F.removeControlButton = name => {
			if(typeof name !== 'string' && (name || {}).name) name = name.name;
			[...document.querySelectorAll(`#controls button[data-control="${name}"]`)].forEach(btn => btn.remove());
		};
		F.addAppButton = (opts = {}) => F.addControlButton(Object.assign({parent: '.controls-app'}, opts));
		F.addAppButtons = (btns = []) => btns.forEach(F.addAppButton);
		F.addAuxButton = (opts = {}) => F.addControlButton(Object.assign({parent: '.controls-aux'}, opts));
		F.addAuxButtons = (btns = []) => btns.forEach(F.addAuxButton);
		F.addToolButton = (opts = {}) => F.addControlButton(Object.assign({parent: '.controls-tool'}, opts));
		F.addToolButtons = (btns = []) => btns.forEach(F.addToolButton);
	// Settings
		F.settingsOpts = [];
		F.settings = {};
		F.settingGroups = [];
		F.tempSettings = ['hidecolours'];
		F.loadSettings = (defaults = {}) => {
			return Object.assign(defaults, F.getData(F.SettingsKey) || {});
		};
		F.saveSettings = () => {
			const {settings, tempSettings, SettingsKey} = F;
			let currData = F.getData(SettingsKey) || {}
			let saveData = {};
			Object.keys(settings).forEach(key => {
				let isTemp = tempSettings.includes(key);
				if(currData[key] !== settings[key]) {
				}
				if(isTemp && currData[key] !== undefined) {
					saveData[key] = currData[key];
				}
				else if(!isTemp) {
					saveData[key] = settings[key];
				}
			});
			F.setData(SettingsKey, saveData);
			return settings;
		};
		F.throttledSaveSettings = throttleFunc(F.saveSettings, F.saveSettingsMinDelay, F.saveSettingsMaxDelay);
		F.setSetting = (name, val) => {
			let prevVal = F.settings[name];
			F.settings[name] = val;
			if(val === undefined) delete F.settings[name];
			F.throttledSaveSettings();
			let settingOpts = F.settingsOpts.find(({name: n}) => n === name);
			if(settingOpts === undefined) return;
			if(typeof settingOpts.onToggle === 'function') settingOpts.onToggle(val, prevVal);
			F.trigger('togglesetting', name, val, prevVal);
		};
		F.getSetting = (name, optionalDefault) => {
			if(!(name in F.settings)) return optionalDefault;
			return F.settings[name];
		};
		F.initSettings = defaults => {
			Framework.updateLegacyData([F.SettingsKey]);
			F.settings = F.loadSettings(defaults);
			// TODO: Refactor this out of Framework and into App
			[...new URLSearchParams(document.location.search)].forEach(([key, val]) => {
				if(key.match(/^setting-/)) {
					let settingName = key.replace(/^setting-/, '').replace(/(colo)r/i, '$1ur');
					let settingValue = ['true', 't', '1', ''].includes(val.toLowerCase());
					F.settings[settingName] = settingValue;
					F.tempSettings.push(settingName);
				}
			});
			// Clean up legacy settings
			if(F.settings['selection'] === undefined) {
				F.settings['selection'] = 'default';
				'light,dark,cage'.split(',')
					.filter(key => F.settings[`selection${key}`] === true)
					.forEach(key => F.settings['selection'] = key);
			}
			// Remove deprecated settings
			let currentSettings = F.settingsOpts
				.map(setting => setting.name)
				.filter(key => typeof key === 'string' && key !== '');
			currentSettings = [...new Set(currentSettings.concat(Object.keys(defaults)))]; // Include defaults
			Object.keys(F.settings)
				.filter(key => currentSettings.indexOf(key) === -1)
				.forEach(key => delete F.settings[key]);
			Object.keys(F.settings).forEach(key => {
				if(typeof F.settings[key] === 'string') {
					document.querySelector('body').classList.toggle(`setting-${key}-${F.settings[key]}`, true);
				}
				else {
					document.querySelector('body').classList.toggle(`setting-${key}`, F.settings[key]);
				}
			});
			F.settingsOpts.forEach(opts => {
				if(typeof opts.init === 'function') opts.init();
				F.setSetting(opts.name, F.settings[opts.name]);
			});
		};
		F.toggleSettingClass = (name, val) => {
			let bodyClassList = document.querySelector('body').classList;
			if(typeof val === 'string') {
				bodyClassList.remove(...[...bodyClassList].filter(className => className.indexOf(`setting-${name}-`) === 0));
				bodyClassList.toggle(`setting-${name}-${val}`, true);
			}
			else {
				bodyClassList.toggle(`setting-${name}`, val);
			}
		};
		F.handleSettingsChange = event => {
			let elem = event.target, name = elem.name, val;
			if(elem.classList.contains('setting-toggle')) val = elem.checked;
			if(elem.classList.contains('setting-multi')) val = elem.value;
			F.toggleSettingClass(name, val);
			F.setSetting(name, val);
		};
	// Groups
		F.addGroup = (group) => {
			F.settingGroups.push(Object.assign({items: []}, group));
		};
		F.addGroups = (items = []) => items.forEach(F.addGroup);
		F.settingToElem = (opts) => {
			let elem = Object.assign(
				{handler: F.handleSettingsChange},
				F.settings[opts.name] ? {value: F.settings[opts.name]} : null,
				opts.content ? {title: opts.content} : null,
				opts
			);
			if(opts.tag === 'button') elem = {className: 'setting-item setting-button', children: [elem]};
			return elem;
		};
		F.handleCollapseGroup = (event) => {
			event.preventDefault();
			event.stopPropagation();
			let groups = F.settingGroups;
			let groupDiv = event.target.closest('.setting-group');
			let groupIdx = [...document.querySelectorAll('.setting-group')].indexOf(groupDiv);
			let group = groups[groupIdx];
			group.closed = !(group.closed === true);
			groupDiv.classList.toggle('closed', group.closed);
			let closedState = groups.reduce((acc, cur) => Object.assign(acc, {[cur.name]: cur.closed === true}), {});
			F.setData('groupsclosed', closedState);
		};
		F.createGroup = (opts = {}) => {
			return ({
				className: 'setting-group' + (opts.closed === true ? ' closed' : ''),
				children: [
					{
						tag: 'label',
						content: opts.label || opts.name || 'Group',
						handler: F.handleCollapseGroup,
						children: [{className: 'icon', innerHTML: F.icons.back}]
					},
					{className: 'setting-groupitems', children: opts.items || []}
				]
			});
		};
		F.showSettings = (opts) => {
			const capitalizeFirstLetter = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);
			let groups = F.settingGroups;
			groups.forEach(({items}) => items.length = 0);
			F.settingsOpts.forEach(item => {
				let group = groups.find(({name}) => name === item.group);
				if(group === undefined) {
					group = {name: item.group, label: capitalizeFirstLetter(item.group), items: []};
					groups.push(group);
					let settingGroup = F.settingGroups.find(({name}) => name === item.group);
					if(settingGroup !== undefined) {
						Object.assign(group, settingGroup);
					}
				}
				group.items.push(F.settingToElem(item));
			});
			let settingsParts = [];
			let closedState = F.getData('groupsclosed') || {};
			groups.forEach(group => {
				if(group.name === undefined || group.items.length === 0) return;
				if(closedState[group.name] !== undefined) group.closed = closedState[group.name];
				settingsParts.push(F.createGroup(group));
			});
			let undefinedGroup = groups.find(({name}) => name === undefined);
			if(undefinedGroup && undefinedGroup.items.length > 0) {
				settingsParts.push(...undefinedGroup.items);
			}
			settingsParts.push({tag: 'options', class: 'sticky', options: [{tag: 'button', innerHTML: `${F.icons.back}Back`, className: 'dialog-back', action: 'close'}]});
			const timerRunningState = F.app.timer.running;
			const handleCloseSettings = (...args) => {
				F.off('closedialog', handleCloseSettings);
				if(timerRunningState) F.app.timer.resume();
			};
			F.on('closedialog', handleCloseSettings);
			if(timerRunningState) F.app.timer.stop();
			return F.showDialog(Object.assign({parts: settingsParts, overlayClass: 'dialog-settings', centerOverBoard: true}, opts));
		};
		F.addSetting = (opts = {}) => {
			F.settingsOpts.push(opts);
		};
		F.addSettings = (items = []) => items.forEach(F.addSetting);
	// Context Menu
		F.handleContextMenu = function(event) {
			event.preventDefault();
			return false;
		};
		F.enableContextMenu = function() {
			window.removeEventListener('contextmenu', F.handleContextMenu);
		};
		F.disableContextMenu = function() {
			F.enableContextMenu(); // Ensure only one event handler
			window.addEventListener('contextmenu', F.handleContextMenu);
		};
	// Handlers
		F.handleResize = function(event) {
			const overlayElem = document.querySelector('.dialog-overlay');
			const boardElem = document.querySelector('.board');
			const centeroverboard = overlayElem.classList.contains('centeroverboard');
			if(centeroverboard && boardElem !== null) {
				const dialogElem = overlayElem.querySelector('.dialog');
				dialogElem.style.removeProperty('margin-left');
				dialogElem.style.removeProperty('margin-right');
				const boardBB = bounds(boardElem), dialogBB = bounds(dialogElem);
				if(boardBB.width < dialogBB.width) return;
				if(boardBB.height < dialogBB.height) return;
				let offset = Math.round((boardBB.x + 0.5 * boardBB.width) - (dialogBB.x + 0.5 * dialogBB.width));
				dialogElem.style['margin-left'] = `${offset}px`;
				dialogElem.style['margin-right'] = `${-offset}px`;
			}
		};

	return F;
})();