<script lang="ts">
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();
</script>

<h3>I have tokens on an exchange and want to create an account.</h3>

<Button href="/{data.network}/create-account/contract">Create Account by Sending Tokens</Button>

<h3>I have an account and want to create another.</h3>

<Button href="/{data.network}/create-account/direct">Create Account</Button>

<h3>I have an account and want to create an msig account to share with other accounts.</h3>

<Button href="/{data.network}/create-account/msig">Create MSIG Account</Button>
