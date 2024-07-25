<script>
import { T, useTask, useLoader } from '@threlte/core'
import { interactivity } from '@threlte/extras'

import Logo from './assets/unicove_logo_3d.svelte'
import Duck from './assets/Duck.svelte'

let rotation = 0

// useTask is relying on a context provided
// by <Canvas>. Because we are definitely *inside*
// <Canvas>, we can safely use it.
useTask((delta) => {
	rotation += delta
})

// This file is also typically the place to
// inject plugins
interactivity()
</script>

<Logo scale={2} rotation.x={Math.PI /2} rotation.z={rotation}/>


