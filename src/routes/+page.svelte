<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { confetti } from '@neoconfetti/svelte';
	import { getRandomKoreanChar, type FontUnit, parseFontSize } from '$lib/calcScale';
	import { gsap } from 'gsap';

	let character = '';
	let fontSize = '';
	let options: string[] = [];
	let score = 0;
	let gameOver = false;
	let showConfetti = false;
	let currentUnit: FontUnit = 'px';
	let characterRef: HTMLSpanElement;
	let rulerRef: HTMLDivElement;
	let sizeDisplayRef: HTMLDivElement;
	let mainContainerRef: HTMLDivElement;

	function getRandomFontSize(min: number, max: number, unit: FontUnit): string {
		const size = Math.random() * (max - min) + min;
		return unit === 'px' ? `${Math.round(size)}px` : `${size.toFixed(2)}rem`;
	}

	function generateOptions(correctSize: string): string[] {
		const { value, unit } = parseFontSize(correctSize);
		const options = [correctSize];

		while (options.length < 4) {
			let option;
			if (unit === 'px') {
				option = getRandomFontSize(Math.max(value - 20, 10), value + 20, 'px');
			} else {
				const minRem = Math.max(value - 1.25, 0.625);
				const maxRem = value + 1.25;
				option = getRandomFontSize(minRem, maxRem, 'rem');
			}

			if (!options.includes(option)) {
				options.push(option);
			}
		}

		return options.sort(() => Math.random() - 0.5);
	}

	function newRound() {
		character = getRandomKoreanChar();
		fontSize =
			currentUnit === 'px'
				? getRandomFontSize(20, 100, 'px')
				: getRandomFontSize(1.25, 6.25, 'rem');
		options = generateOptions(fontSize);
	}

	function checkAnswer(selected: string) {
		if (selected === fontSize) {
			score++;
			showConfetti = true;
			setTimeout(() => {
				showConfetti = false;
				newRound();
			}, 1500);
		} else {
			gameOver = true;
			showMeasurement();
		}
	}

	function showMeasurement() {
		const { value, unit } = parseFontSize(fontSize);
		const pixelValue = unit === 'rem' ? value * 16 : value;

		gsap.set([rulerRef, sizeDisplayRef], { width: 0, opacity: 0, display: 'block' });
		gsap.to(rulerRef, {
			width: pixelValue,
			opacity: 1,
			duration: 1.5,
			ease: 'power2.inOut'
		});

		gsap.to(sizeDisplayRef, {
			width: '100%',
			opacity: 1,
			duration: 1.5,
			ease: 'power2.inOut'
		});

		let currentValue = { val: 0 };
		gsap.to(sizeDisplayRef, {
			val: pixelValue,
			duration: 1.5,
			ease: 'power2.inOut',
			onUpdate: function () {
				sizeDisplayRef.textContent = Math.round(pixelValue) + (unit === 'px' ? 'px' : 'rem');
			}
		});
	}

	function restartGame() {
		score = 0;
		gameOver = false;
		gsap.set([rulerRef, sizeDisplayRef], { display: 'none', width: 0, opacity: 0 });
		newRound();
	}
	function toggleUnit() {
		currentUnit = currentUnit === 'px' ? 'rem' : 'px';
		newRound();
	}

	onMount(() => {
		newRound();
		gsap.set([rulerRef, sizeDisplayRef], { display: 'none', width: 0, opacity: 0 });

		// Prevent scrolling when confetti is shown
		const resizeObserver = new ResizeObserver(() => {
			if (mainContainerRef) {
				mainContainerRef.style.height = `${window.innerHeight}px`;
			}
		});
		resizeObserver.observe(document.body);

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<div
	bind:this={mainContainerRef}
	class="flex flex-col overflow-hidden bg-background text-foreground"
>
	<header class="p-4 text-center">
		<h1 class="text-2xl font-bold">폰트 크기 맞추기</h1>
		<p class="text-lg">점수: {score}</p>
		<Button on:click={toggleUnit} class="mt-2">단위 변경: {currentUnit}</Button>
	</header>
	{#if showConfetti}
		<div
			use:confetti={{
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 }
			}}
		/>
	{/if}

	<p style="font-size: 12px;">
		AI한테 시켜서 20분만에 만들어봤습니다. 막상 만들어보니 너무 어렵네요!! 2지선다로 줄여야 할 것
		같아요. 그리고 저희 제품인 폰트 스케일 상품의 정교한 스크린샷이 있다면 컴포넌트로 만든
		'견본크기' 박스를 대체할 수 있지 않을까 싶습니다.
	</p>
	<main class="flex flex-grow flex-col items-center justify-center p-4">
		<div class="mb-8 flex items-center">
			<div
				class="relative mr-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg bg-primary shadow-lg"
				in:fly={{ y: -20, duration: 500 }}
			>
				<span
					bind:this={characterRef}
					style="font-size: {fontSize};"
					class="relative z-10 text-primary-foreground"
				>
					{character}
				</span>
				<div class="absolute bottom-0 left-0 flex w-full items-center justify-center">
					<div bind:this={rulerRef} class="z-20 h-2 bg-red-500" style="display: none;"></div>
				</div>
			</div>
			<div class="text-center">
				<p class="mb-2">견본 크기:</p>
				<div
					class="mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-secondary shadow-lg"
				>
					<span style="font-size: 16px;" class="text-secondary-foreground">가</span>
				</div>
				<p>16px / 1rem</p>
			</div>
			<div class="text-center">
				<p class="mb-2">견본 크기:</p>
				<div
					class="mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-secondary shadow-lg"
				>
					<span style="font-size: 24px;" class="text-secondary-foreground">가</span>
				</div>
				<p>24px / 1.5rem</p>
			</div>
		</div>
		{#if !gameOver}
			<div class="grid w-full max-w-sm grid-cols-2 gap-4">
				{#each options as option}
					<Button variant="outline" on:click={() => checkAnswer(option)} class="text-lg">
						{option}
					</Button>
				{/each}
			</div>
		{:else}
			<div class="text-center">
				<h2 class="mb-4 text-3xl font-bold">게임 오버!</h2>
				<p class="mb-4 text-xl">최종 점수: {score}</p>
				<div class="mb-4 rounded-lg bg-secondary p-4">
					<p class="mb-2 text-lg">정답:</p>
					<div bind:this={sizeDisplayRef} class="text-3xl font-bold text-primary">0</div>
				</div>
				<Button on:click={restartGame}>다시 시작</Button>
			</div>
		{/if}
	</main>
</div>
