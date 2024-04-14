<template>
	<div id="donate-button"></div>
	<div class="contact-list">
		<div>
			<p>For any issues, questions or suggestions about this converter contact me:</p>
			<div>
				<div>
					<svg class="mx-3 vertical-align-middle" width="24" height="24" viewBox="0 -29 256 256">
						<path
							fill="#5865F2"
							d="M217 17c-17-8-34-14-53-17l-7 14c-19-3-39-3-58 0L92 0C73 3 56 9 39 17 6 67-3 116 1 165c22 17 44 27 65 33l14-23-22-10 5-5c42 20 88 20 130 0l5 5-22 10 14 23c21-6 43-16 65-33 5-56-9-105-38-148ZM85 135c-12 0-23-12-23-26s11-26 23-26c13 0 24 12 23 26 1 14-10 26-23 26Zm86 0c-13 0-23-12-23-26s10-26 23-26c12 0 23 12 23 26s-11 26-23 26Z"
						/>
					</svg>
					<span class="pr-2">Discord:</span><a href="https://discordapp.com/users/MarkTekfan" target="_blank">MarkTekfan</a>
				</div>
				<div>
					<svg
						class="mx-3 vertical-align-middle"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
						<polyline points="22,6 12,13 2,6" />
					</svg>
					<span class="pr-2">Email:</span><a href="mailto:MarkTekfan@gmail.com">MarkTekfan@gmail.com</a>
				</div>
			</div>
		</div>
	</div>
	<div class="">
		<span>Created by <a href="https://discordapp.com/users/MarkTekfan" target="_blank">Mark Langezaal</a>. </span>
		<span>SudokuPad is created by <a href="https://svencodes.com" target="_blank">Sven Neumann</a></span>
	</div>

	<div class="mt-3">
		<div class="my-1">If you like what I do, you can buy me a coffee!</div>
		<a id="kofi-donate-button" class="kofi-donate-button" style="background-color: #00b9fe" href="https://ko-fi.com/marktekfan" target="_blank">
			<img src="https://storage.ko-fi.com/cdn/cup-border.png" class="kofi-logo kofi-logo-animation" />
			<span style="margin-left: 8px; color: #fff">Buy Me a Coffee</span>
		</a>
	</div>
</template>

<style scoped>
.kofi-donate-button {
	text-decoration: none;
	background-color: #00b4f7;
	height: 46px;
	display: flex;
	align-items: center;
	font-family: nunito, quicksand, sans-serif;
	font-size: 16px;
	width: max-content;
	color: #fff;
	justify-content: space-between;
	padding: 0 20px;
	font-weight: 700;
	cursor: pointer;
	-webkit-border-radius: 100px;
	-moz-border-radius: 100px;
	-ms-border-radius: 100px;
	-o-border-radius: 100px;
	border-radius: 100px;
	display: flex !important;
}

.kofi-logo {
	width: 39px;
}

.kofi-logo-animation {
	animation: kofi-shake 8s infinite;
}
@keyframes kofi-shake {
	0% {
		transform: rotate(0deg);
	}
	2% {
		transform: rotate(10deg);
	}
	4% {
		transform: rotate(0deg) scale(150%);
	}
	8% {
		transform: rotate(-7deg);
	}
	10% {
		transform: rotate(0deg);
	}
	40% {
		transform: rotate(0deg);
	}
	42% {
		transform: rotate(7deg);
	}
	44% {
		transform: rotate(0deg) scale(130%);
	}
	48% {
		transform: rotate(-15deg);
	}
	50% {
		transform: rotate(5deg) scale(130%);
	}
	52% {
		transform: rotate(-10deg);
	}
	54% {
		transform: rotate(5deg);
	}
	55% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(0deg);
	}
}
</style>
