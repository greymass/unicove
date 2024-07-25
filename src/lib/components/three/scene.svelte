<script>
import { T, useTask, useLoader } from '@threlte/core'
import { interactivity } from '@threlte/extras'

import Logo from './assets/unicove_logo_3d.svelte'

// let rotation = 0

// useTask is relying on a context provided
// by <Canvas>. Because we are definitely *inside*
// <Canvas>, we can safely use it.
// useTask((delta) => {
// 	rotation += delta
// })

// This file is also typically the place to
// inject plugins
interactivity()

let mouseX = $state(0)
let mouseY = $state(0)

let windowWidth
let windowHeight

function handleMouseMove(e) {
	mouseX = e.clientX
	mouseY = e.clientY
}

let canvasWidth = 10
let canvasHeight = 10

let lightX = $derived(((mouseX / windowWidth) * canvasWidth) - (canvasWidth / 2))
let lightY = $derived(-(((mouseY / windowHeight) * canvasHeight) - (canvasHeight / 2)))

// $inspect({ lightX, lightY })

</script>

<svelte:window on:mousemove={handleMouseMove} 
	bind:innerWidth={windowWidth}
	bind:innerHeight={windowHeight} />

<!-- <T.AxesHelper size={10} /> -->

<!-- <T.Mesh position.x={lightX} position.y={lightY} position.z={1}> -->
<!-- 	<T.BoxGeometry args={[1, 1, 1]} /> -->
<!-- 	<T.MeshStandardMaterial color="red" /> -->
<!-- </T.Mesh> -->

<T.DirectionalLight position={[lightX, lightY, 5]} />

<Logo scale={4}  rotation.x={Math.PI /2} />


