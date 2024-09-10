<script lang="ts">
	export let bytes: number | undefined;

	function bytesToKB(bytes: number | undefined): string {
		return ((Number(bytes) || 0) / 1000).toFixed(2);
	}
</script>

<span>{bytesToKB(bytes)} KB</span>
