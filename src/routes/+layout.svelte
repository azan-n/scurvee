<script lang="ts">
	import '../app.css';
	import { TONE_STATE, initializeTone } from '../components/tone.svelte';
	let { children } = $props();
</script>

<header class="border-b p-4 flex items-center justify-between">
	<h1 class="font-mono text-sm">scurvee</h1>
	<!-- Tone should be global, so we can create more of control params or multiple synths playing loops -->
	{#if !TONE_STATE.initializing && !TONE_STATE.initialized}
		<button onclick={async () => await initializeTone()}>Initialize</button>
	{/if}
</header>

{#if TONE_STATE.initialized}
	<main>
		{@render children()}
	</main>
{/if}
