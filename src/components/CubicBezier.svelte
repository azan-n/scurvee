<script lang="ts">
	import { Bezier } from 'bezier-js';
	import * as Tone from 'tone';
	type Point = {
		x: number;
		y: number;
	};

	const POINT_RADIUS = 10;

	let _points = $state([
		{ x: 10, y: 500 },
		{ x: 200, y: 100 },
		{ x: 400, y: 100 },
		{ x: 790, y: 500 }
	]);

	// Bezier class derived from Points[];
	let _bezier = $derived(new Bezier(_points));

	// y-values are flipped for some reason?
	let _bezierPath = $derived(
		`M ${_points[0].x} ${_points[0].y} C ${_points[1].x} ${_points[1].y}, ${_points[2].x} ${_points[2].y}, ${_points[3].x} ${_points[3].y}`
	);

	// The control point being dragged
	let _dragging: number | null = $state(null);
	//
	let _dragOffset: Point | null = $state(null);

	// Mouse events for dragging control points
	const onmousedown = (e: MouseEvent, index: number) => {
		const mouseX = e.offsetX;
		const mouseY = e.offsetY;

		_dragging = index; // Start dragging this control point

		// TODO Can be optimized, instead of object assignments, use property assignments
		_dragOffset = { x: mouseX - _points[index].x, y: mouseY - _points[index].y }; // Store offset
	};

	const onmousemove = (e: MouseEvent) => {
		if (_dragging === null) {
			return;
		}

		const mouseX = e.offsetX;
		const mouseY = e.offsetY;

		const newControlPoints = [..._points];
		if (_dragging === 0 || _dragging === _points.length - 1) {
			// If dragging the first or last point, only update the y-coordinate
			newControlPoints[_dragging] = {
				x: _points[_dragging].x, // Keep the x-coordinate fixed
				y: mouseY - (_dragOffset?.y ?? 0) // Update the y-coordinate
			};
		} else {
			// For all other points, update both x and y coordinates
			newControlPoints[_dragging] = {
				x: mouseX - (_dragOffset?.x ?? 0),
				y: mouseY - (_dragOffset?.y ?? 0)
			};
		}
		_points = newControlPoints; // Update control points
	};

	const onmouseup = () => {
		// Stop dragging
		_dragging = null;
	};

	// PolySynth at some point?
	let _synth: Tone.PolySynth | null = $state(null);
	let _loop: Tone.Loop | null = $state(null);
	let _playing: boolean = $state(false);

	const play = () => {
		const synth = new Tone.PolySynth(Tone.Synth).toDestination();
		_synth = synth;

		const loop = new Tone.Loop(getLoopCallback(_bezier, _synth), '4n');
		_loop = loop;
		loop.start();

		if (Tone.getTransport().state !== 'started') {
			// all loops start when the Transport is started
			Tone.getTransport().start();
		}
		_playing = true; // Toggle the play/pause state
	};

	const stop = () => {
		_synth?.dispose();
		_synth = null;
		_loop?.dispose();
		_loop = null;
		_playing = false;
	};

	const toggle = () => {
		if (_playing) {
			stop();
		} else {
			play();
		}
	};

	///
	$effect(() => {
		if (_loop && _playing === true && _synth) {
			_loop.callback = getLoopCallback(_bezier, _synth);
		}
	});

	function getLoopCallback(
		bezier: Bezier,
		synth: Tone.PolySynth
	): (time: Tone.Unit.Seconds) => void {
		return (time) => {
			const lut = bezier.getLUT(4);
			const yValues = lut.map((point) => point.y);
			synth?.triggerAttackRelease(yValues, '8n', time);
		};
	}

	$inspect(_synth);
	$inspect(_loop);
	$inspect(_points);
</script>

<button onclick={toggle}>{_playing ? 'Stop' : 'Play'}</button>
<svg {onmousemove} {onmouseup} viewBox="0 0 800 600" role="presentation" class="h-96">
	<!-- Just the bezier curve -->
	<path d={_bezierPath} class="stroke-slate-400 stroke-1" fill="transparent" />

	<!-- Circles on the ends of the curve to modify the curve -->
	{#each _points as point, index (point)}
		<circle
			role="presentation"
			onmousedown={(e) => onmousedown(e, index)}
			cx={point.x}
			cy={point.y}
			r={POINT_RADIUS}
			class="fill-slate-400"
		/>
	{/each}

	{#each _points.slice(0, -1) as point, index (point)}
		<line
			x1={point.x}
			y1={point.y}
			x2={_points[index + 1].x}
			y2={_points[index + 1].y}
			class="stroke-slate-700 stroke-2"
		/>
	{/each}
</svg>
