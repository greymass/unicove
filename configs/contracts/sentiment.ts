import type { Action, AssetType, NameType, UInt32Type, UInt8Type } from '@wharfkit/antelope';
import {
	ABI,
	Asset,
	Blob,
	Checksum256,
	Int64,
	Name,
	Struct,
	UInt32,
	UInt8
} from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yACwQYWNjb3VudF92b3RlX3JvdwADBXZvdGVyBG5hbWUHYWNjb3VudARuYW1lCXZvdGVfdHlwZQV1aW50OAtiYWxhbmNlX3JvdwACB2FjY291bnQEbmFtZQdiYWxhbmNlBWFzc2V0C2J1bGtybXZvdGVzAAIIdG9waWNfaWQEbmFtZQludW1fdm90ZXMGdWludDMyCmNoYW5nZXZvdGUAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4CmNvbmZpZ19yb3cAAwdlbmFibGVkBGJvb2wPc3lzdGVtX2NvbnRyYWN0BG5hbWUEZmVlcwtmZWVzX2NvbmZpZwtjcmVhdGV0b3BpYwAEB2NyZWF0b3IEbmFtZQJpZARuYW1lC2Rlc2NyaXB0aW9uBnN0cmluZwdwYXltZW50BWFzc2V0C2RlbGV0ZXRvcGljAAECaWQEbmFtZQdkaXNhYmxlAAAGZW5hYmxlAAALZmVlc19jb25maWcABAV0b2tlbhB0b2tlbl9kZWZpbml0aW9uCHJlY2VpdmVyBG5hbWULY3JlYXRldG9waWMFYXNzZXQGYWN0aW9uBG5hbWUZZ2V0X2FjY291bnRfdm90ZV9yZXNwb25zZQADBXZvdGVyBG5hbWUHYWNjb3VudARuYW1lCXZvdGVfdHlwZQV1aW50OBZnZXRfbXNpZ192b3RlX3Jlc3BvbnNlAAQFdm90ZXIEbmFtZQhwcm9wb3NlcgRuYW1lDXByb3Bvc2FsX25hbWUEbmFtZQl2b3RlX3R5cGUFdWludDgSZ2V0X3RvcGljX3Jlc3BvbnNlAAMCaWQEbmFtZQtkZXNjcmlwdGlvbgZzdHJpbmcHY3JlYXRvcgRuYW1lF2dldF90b3BpY192b3RlX3Jlc3BvbnNlAAMFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lCXZvdGVfdHlwZQV1aW50OBlnZXRfdm90ZXJfd2VpZ2h0X3Jlc3BvbnNlAAIFdm90ZXIEbmFtZQZ3ZWlnaHQFaW50NjQLZ2V0YWNjdHZvdGUAAgV2b3RlcgRuYW1lB2FjY291bnQEbmFtZQpnZXRhY3R2dHJzAAEHYWNjb3VudARuYW1lC2dldG1zaWd2b3RlAAMFdm90ZXIEbmFtZQhwcm9wb3NlcgRuYW1lDXByb3Bvc2FsX25hbWUEbmFtZQtnZXRtc2lndnRycwACCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lCGdldHRvcGljAAECaWQEbmFtZQlnZXR0b3BpY3MAAAxnZXR0b3BpY3ZvdGUAAgV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUMZ2V0dG9waWN2dHJzAAEIdG9waWNfaWQEbmFtZQdnZXR2b3RlAAIFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lCWdldHZvdGVycwABCHRvcGljX2lkBG5hbWUJZ2V0d2VpZ2h0AAEFdm90ZXIEbmFtZQpnZXR3ZWlnaHRzAAEGdm90ZXJzBm5hbWVbXQ1tc2lnX3ZvdGVfcm93AAQFdm90ZXIEbmFtZQhwcm9wb3NlcgRuYW1lDXByb3Bvc2FsX25hbWUEbmFtZQl2b3RlX3R5cGUFdWludDgEb3BlbgABB2FjY291bnQEbmFtZQpyZW1vdmV2b3RlAAIFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lBXJlc2V0AAAKcm1hY2N0dm90ZQACBXZvdGVyBG5hbWUHYWNjb3VudARuYW1lCnJtbXNpZ3ZvdGUAAwV2b3RlcgRuYW1lCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lC3JtdG9waWN2b3RlAAIFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lCXNldGNvbmZpZwAGD3N5c3RlbV9jb250cmFjdARuYW1lDnRva2VuX2NvbnRyYWN0BG5hbWUMdG9rZW5fYWN0aW9uBG5hbWUMdG9rZW5fc3ltYm9sBnN5bWJvbAxmZWVfcmVjZWl2ZXIEbmFtZQ9jcmVhdGV0b3BpY19mZWUFYXNzZXQQdG9rZW5fZGVmaW5pdGlvbgADBWNoYWluDGNoZWNrc3VtMjU2Pwhjb250cmFjdARuYW1lBnN5bWJvbAZzeW1ib2wJdG9waWNfcm93AAMCaWQEbmFtZQtkZXNjcmlwdGlvbgZzdHJpbmcHY3JlYXRvcgRuYW1lDnRvcGljX3ZvdGVfcm93AAMFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lCXZvdGVfdHlwZQV1aW50OAt1cGRhdGV0b3BpYwACAmlkBG5hbWULZGVzY3JpcHRpb24Gc3RyaW5nBHZvdGUAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4C3ZvdGVhY2NvdW50AAMFdm90ZXIEbmFtZQdhY2NvdW50BG5hbWUJdm90ZV90eXBlBXVpbnQ4CHZvdGVtc2lnAAQFdm90ZXIEbmFtZQhwcm9wb3NlcgRuYW1lDXByb3Bvc2FsX25hbWUEbmFtZQl2b3RlX3R5cGUFdWludDgJdm90ZXRvcGljAAMFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lCXZvdGVfdHlwZQV1aW50OAh3aXRoZHJhdwACB2FjY291bnQEbmFtZQhxdWFudGl0eQVhc3NldB8AsMp0ywujPgtidWxrcm12b3Rlc7ACLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdCdWxrIFJlbW92ZSBWb3RlcycKc3VtbWFyeTogJ01haW50YWluZXIgYWN0aW9uIHRvIHJlbW92ZSBtdWx0aXBsZSB2b3RlcyBmcm9tIGEgdG9waWMgZm9yIGFkbWluaXN0cmF0aXZlIHB1cnBvc2VzLiBSZW1vdmVzIHVwIHRvIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIHZvdGVzLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQCAynQrNk1DCmNoYW5nZXZvdGWJAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnQ2hhbmdlIFZvdGUnCnN1bW1hcnk6ICdBbGxvd3MgYSB1c2VyIHRvIGNoYW5nZSB0aGVpciBleGlzdGluZyB2b3RlIG9uIGEgdG9waWMgZnJvbSBzdXBwb3J0IHRvIG9wcG9zaXRpb24gb3IgdmljZSB2ZXJzYS4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AkKs0q2zURQtjcmVhdGV0b3BpY+QBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdDcmVhdGUgVG9waWMnCnN1bW1hcnk6ICdDcmVhdGVzIGEgbmV3IHRvcGljIHdpdGggdGhlIHNwZWNpZmllZCBJRCBhbmQgZGVzY3JpcHRpb24uJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAJCrNKusokoLZGVsZXRldG9waWPWAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnRGVsZXRlIFRvcGljJwpzdW1tYXJ5OiAnRGVsZXRlcyBhbiBleGlzdGluZyB0b3BpYyBmcm9tIHRoZSByZWdpc3RyeS4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAABAxWOwSwdkaXNhYmxlhQItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0Rpc2FibGUgQ29udHJhY3QnCnN1bW1hcnk6ICdNYWludGFpbmVyIGFjdGlvbiB0byBkaXNhYmxlIHRoZSBjb250cmFjdCwgcHJldmVudGluZyB1c2VyIGFjdGlvbnMgZnJvbSBiZWluZyBleGVjdXRlZC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAAqHjMVAZlbmFibGX8AS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnRW5hYmxlIENvbnRyYWN0JwpzdW1tYXJ5OiAnTWFpbnRhaW5lciBhY3Rpb24gdG8gZW5hYmxlIHRoZSBjb250cmFjdCwgYWxsb3dpbmcgdXNlciBhY3Rpb25zIHRvIGJlIGV4ZWN1dGVkLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQBUpjsjZLJiC2dldGFjY3R2b3RlAAAAvnlnZLJiCmdldGFjdHZ0cnMAAFSmmzkss2ILZ2V0bXNpZ3ZvdGUAAPDNmzkss2ILZ2V0bXNpZ3Z0cnMAAAAAyFWas2IIZ2V0dG9waWPWAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IFRvcGljJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byByZXRyaWV2ZSBhIHRvcGljIGJ5IGl0cyBJRC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAMDIVZqzYglnZXR0b3BpY3PmAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IEFsbCBUb3BpY3MnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIGFsbCB0b3BpY3MgZnJvbSB0aGUgcmVnaXN0cnkuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0toDLdyFWas2IMZ2V0dG9waWN2b3RlAIBv3shVmrNiDGdldHRvcGljdnRycwAAAABAZbqzYgdnZXR2b3Rl5gEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0dldCBWb3RlJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byByZXRyaWV2ZSBhIHNwZWNpZmljIHVzZXJcJ3Mgdm90ZSBvbiBhIHRvcGljLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAwFdlurNiCWdldHZvdGVyc/kBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgQWxsIFZvdGVycycKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gcmV0cmlldmUgYWxsIHZvdGVycyBhbmQgdGhlaXIgdm90ZXMgZm9yIGEgc3BlY2lmaWMgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAADIjTnFs2IJZ2V0d2VpZ2h0nAItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0dldCBWb3RlciBXZWlnaHQnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIHRoZSB2b3Rpbmcgd2VpZ2h0IG9mIGEgdm90ZXIgYmFzZWQgb24gdGhlaXIgc3Rha2VkIHRva2VucyBpbiB0aGUgc3lzdGVtIGNvbnRyYWN0LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAzo05xbNiCmdldHdlaWdodHOvAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IE11bHRpcGxlIFZvdGVyIFdlaWdodHMnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIHRoZSB2b3Rpbmcgd2VpZ2h0cyBvZiBtdWx0aXBsZSB2b3RlcnMgYmFzZWQgb24gdGhlaXIgc3Rha2VkIHRva2VucyBpbiB0aGUgc3lzdGVtIGNvbnRyYWN0LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAAAAMFWlBG9wZW4AAIDKdKtNpboKcmVtb3Zldm90ZdkBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdSZW1vdmUgVm90ZScKc3VtbWFyeTogJ0FsbG93cyBhIHVzZXIgdG8gcmVtb3ZlIHRoZWlyIHZvdGUgZnJvbSBhIHRvcGljLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAACArLC6BXJlc2V0AACAynRnhIy8CnJtYWNjdHZvdGUAAIDKdDOHpbwKcm1tc2lndm90ZQAAVKYbuUqzvAtybXRvcGljdm90ZQAAAGBuTYqywglzZXRjb25maWeVAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnU2V0IENvbnRyYWN0IENvbmZpZ3VyYXRpb24nCnN1bW1hcnk6ICdNYWludGFpbmVyIGFjdGlvbiB0byBzZXQgdGhlIHZhbHVlcyBvZiB0aGUgY29uZmlnIHRhYmxlIHRvIHVwZGF0ZSBob3cgdGhpcyBjb250cmFjdCBvcGVyYXRlcy4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AkKs0q2xS1Qt1cGRhdGV0b3BpY9cBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdVcGRhdGUgVG9waWMnCnN1bW1hcnk6ICdVcGRhdGVzIHRoZSBkZXNjcmlwdGlvbiBvZiBhbiBleGlzdGluZyB0b3BpYy4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAAAKAy3QR2b3Rl9wEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ1ZvdGUgb24gVG9waWMnCnN1bW1hcnk6ICdBbGxvd3MgYSB1c2VyIHRvIGV4cHJlc3MgdGhlaXIgc2VudGltZW50IChzdXBwb3J0IG9yIG9wcG9zaXRpb24pIG9uIGEgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAPLUFCGjMt0Ldm90ZWFjY291bnQAAAAAzGGpMt0Idm90ZW1zaWcAAABArtKsMt0Jdm90ZXRvcGljAAAAANzc1LLjCHdpdGhkcmF3AAaAVaY7T00RMgNpNjQAABBhY2NvdW50X3ZvdGVfcm93AAAAQKFpojkDaTY0AAALYmFsYW5jZV9yb3cAAAAAMLcmRQNpNjQAAApjb25maWdfcm93AADAKtPNHJYDaTY0AAANbXNpZ192b3RlX3JvdwAAAABg5CrNA2k2NAAACXRvcGljX3JvdwAAAAAArDLdA2k2NAAADnRvcGljX3ZvdGVfcm93AQlzZW50aW1lbnQJc2VudGltZW50AAAADABUpjsjZLJiGWdldF9hY2NvdW50X3ZvdGVfcmVzcG9uc2UAAL55Z2SyYhtnZXRfYWNjb3VudF92b3RlX3Jlc3BvbnNlW10AVKabOSyzYhZnZXRfbXNpZ192b3RlX3Jlc3BvbnNlAPDNmzkss2IYZ2V0X21zaWdfdm90ZV9yZXNwb25zZVtdAAAAyFWas2ISZ2V0X3RvcGljX3Jlc3BvbnNlAADAyFWas2IUZ2V0X3RvcGljX3Jlc3BvbnNlW12gMt3IVZqzYhdnZXRfdG9waWNfdm90ZV9yZXNwb25zZYBv3shVmrNiGWdldF90b3BpY192b3RlX3Jlc3BvbnNlW10AAABAZbqzYhdnZXRfdG9waWNfdm90ZV9yZXNwb25zZQAAwFdlurNiGWdldF90b3BpY192b3RlX3Jlc3BvbnNlW10AAMiNOcWzYhlnZXRfdm90ZXJfd2VpZ2h0X3Jlc3BvbnNlAADOjTnFs2IbZ2V0X3ZvdGVyX3dlaWdodF9yZXNwb25zZVtd'
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('account_vote_row')
	export class account_vote_row extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('balance_row')
	export class balance_row extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare balance: Asset;
	}
	@Struct.type('bulkrmvotes')
	export class bulkrmvotes extends Struct {
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt32)
		declare num_votes: UInt32;
	}
	@Struct.type('changevote')
	export class changevote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('token_definition')
	export class token_definition extends Struct {
		@Struct.field(Checksum256, { optional: true })
		declare chain?: Checksum256;
		@Struct.field(Name)
		declare contract: Name;
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
	}
	@Struct.type('fees_config')
	export class fees_config extends Struct {
		@Struct.field(token_definition)
		declare token: token_definition;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare createtopic: Asset;
		@Struct.field(Name)
		declare action: Name;
	}
	@Struct.type('config_row')
	export class config_row extends Struct {
		@Struct.field('bool')
		declare enabled: boolean;
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(fees_config)
		declare fees: fees_config;
	}
	@Struct.type('createtopic')
	export class createtopic extends Struct {
		@Struct.field(Name)
		declare creator: Name;
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
		@Struct.field(Asset)
		declare payment: Asset;
	}
	@Struct.type('deletetopic')
	export class deletetopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
	}
	@Struct.type('disable')
	export class disable extends Struct {}
	@Struct.type('enable')
	export class enable extends Struct {}
	@Struct.type('get_account_vote_response')
	export class get_account_vote_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('get_msig_vote_response')
	export class get_msig_vote_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('get_topic_response')
	export class get_topic_response extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
		@Struct.field(Name)
		declare creator: Name;
	}
	@Struct.type('get_topic_vote_response')
	export class get_topic_vote_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('get_voter_weight_response')
	export class get_voter_weight_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Int64)
		declare weight: Int64;
	}
	@Struct.type('getacctvote')
	export class getacctvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('getactvtrs')
	export class getactvtrs extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('getmsigvote')
	export class getmsigvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
	}
	@Struct.type('getmsigvtrs')
	export class getmsigvtrs extends Struct {
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
	}
	@Struct.type('gettopic')
	export class gettopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
	}
	@Struct.type('gettopics')
	export class gettopics extends Struct {}
	@Struct.type('gettopicvote')
	export class gettopicvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('gettopicvtrs')
	export class gettopicvtrs extends Struct {
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('getvote')
	export class getvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('getvoters')
	export class getvoters extends Struct {
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('getweight')
	export class getweight extends Struct {
		@Struct.field(Name)
		declare voter: Name;
	}
	@Struct.type('getweights')
	export class getweights extends Struct {
		@Struct.field(Name, { array: true })
		declare voters: Name[];
	}
	@Struct.type('msig_vote_row')
	export class msig_vote_row extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('open')
	export class open extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('removevote')
	export class removevote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('reset')
	export class reset extends Struct {}
	@Struct.type('rmacctvote')
	export class rmacctvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('rmmsigvote')
	export class rmmsigvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
	}
	@Struct.type('rmtopicvote')
	export class rmtopicvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('setconfig')
	export class setconfig extends Struct {
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(Name)
		declare token_contract: Name;
		@Struct.field(Name)
		declare token_action: Name;
		@Struct.field(Asset.Symbol)
		declare token_symbol: Asset.Symbol;
		@Struct.field(Name)
		declare fee_receiver: Name;
		@Struct.field(Asset)
		declare createtopic_fee: Asset;
	}
	@Struct.type('topic_row')
	export class topic_row extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
		@Struct.field(Name)
		declare creator: Name;
	}
	@Struct.type('topic_vote_row')
	export class topic_vote_row extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('updatetopic')
	export class updatetopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
	}
	@Struct.type('vote')
	export class vote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('voteaccount')
	export class voteaccount extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('votemsig')
	export class votemsig extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('votetopic')
	export class votetopic extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('withdraw')
	export class withdraw extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
	}
}
export const TableMap = {
	accountvotes: Types.account_vote_row,
	balance: Types.balance_row,
	config: Types.config_row,
	msigvotes: Types.msig_vote_row,
	topics: Types.topic_row,
	votes: Types.topic_vote_row
};
export interface TableTypes {
	accountvotes: Types.account_vote_row;
	balance: Types.balance_row;
	config: Types.config_row;
	msigvotes: Types.msig_vote_row;
	topics: Types.topic_row;
	votes: Types.topic_vote_row;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {}
	export interface bulkrmvotes {
		topic_id: NameType;
		num_votes: UInt32Type;
	}
	export interface changevote {
		voter: NameType;
		topic_id: NameType;
		vote_type: UInt8Type;
	}
	export interface createtopic {
		creator: NameType;
		id: NameType;
		description: string;
		payment: AssetType;
	}
	export interface deletetopic {
		id: NameType;
	}
	export interface disable {}
	export interface enable {}
	export interface getacctvote {
		voter: NameType;
		account: NameType;
	}
	export interface getactvtrs {
		account: NameType;
	}
	export interface getmsigvote {
		voter: NameType;
		proposer: NameType;
		proposal_name: NameType;
	}
	export interface getmsigvtrs {
		proposer: NameType;
		proposal_name: NameType;
	}
	export interface gettopic {
		id: NameType;
	}
	export interface gettopics {}
	export interface gettopicvote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface gettopicvtrs {
		topic_id: NameType;
	}
	export interface getvote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface getvoters {
		topic_id: NameType;
	}
	export interface getweight {
		voter: NameType;
	}
	export interface getweights {
		voters: NameType[];
	}
	export interface open {
		account: NameType;
	}
	export interface removevote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface reset {}
	export interface rmacctvote {
		voter: NameType;
		account: NameType;
	}
	export interface rmmsigvote {
		voter: NameType;
		proposer: NameType;
		proposal_name: NameType;
	}
	export interface rmtopicvote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface setconfig {
		system_contract: NameType;
		token_contract: NameType;
		token_action: NameType;
		token_symbol: Asset.SymbolType;
		fee_receiver: NameType;
		createtopic_fee: AssetType;
	}
	export interface updatetopic {
		id: NameType;
		description: string;
	}
	export interface vote {
		voter: NameType;
		topic_id: NameType;
		vote_type: UInt8Type;
	}
	export interface voteaccount {
		voter: NameType;
		account: NameType;
		vote_type: UInt8Type;
	}
	export interface votemsig {
		voter: NameType;
		proposer: NameType;
		proposal_name: NameType;
		vote_type: UInt8Type;
	}
	export interface votetopic {
		voter: NameType;
		topic_id: NameType;
		vote_type: UInt8Type;
	}
	export interface withdraw {
		account: NameType;
		quantity: AssetType;
	}
}
export interface ActionNameParams {
	bulkrmvotes: ActionParams.bulkrmvotes;
	changevote: ActionParams.changevote;
	createtopic: ActionParams.createtopic;
	deletetopic: ActionParams.deletetopic;
	disable: ActionParams.disable;
	enable: ActionParams.enable;
	getacctvote: ActionParams.getacctvote;
	getactvtrs: ActionParams.getactvtrs;
	getmsigvote: ActionParams.getmsigvote;
	getmsigvtrs: ActionParams.getmsigvtrs;
	gettopic: ActionParams.gettopic;
	gettopics: ActionParams.gettopics;
	gettopicvote: ActionParams.gettopicvote;
	gettopicvtrs: ActionParams.gettopicvtrs;
	getvote: ActionParams.getvote;
	getvoters: ActionParams.getvoters;
	getweight: ActionParams.getweight;
	getweights: ActionParams.getweights;
	open: ActionParams.open;
	removevote: ActionParams.removevote;
	reset: ActionParams.reset;
	rmacctvote: ActionParams.rmacctvote;
	rmmsigvote: ActionParams.rmmsigvote;
	rmtopicvote: ActionParams.rmtopicvote;
	setconfig: ActionParams.setconfig;
	updatetopic: ActionParams.updatetopic;
	vote: ActionParams.vote;
	voteaccount: ActionParams.voteaccount;
	votemsig: ActionParams.votemsig;
	votetopic: ActionParams.votetopic;
	withdraw: ActionParams.withdraw;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	getacctvote: Types.get_account_vote_response;
	getactvtrs: Types.get_account_vote_response[];
	getmsigvote: Types.get_msig_vote_response;
	getmsigvtrs: Types.get_msig_vote_response[];
	gettopic: Types.get_topic_response;
	gettopics: Types.get_topic_response[];
	gettopicvote: Types.get_topic_vote_response;
	gettopicvtrs: Types.get_topic_vote_response[];
	getvote: Types.get_topic_vote_response;
	getvoters: Types.get_topic_vote_response[];
	getweight: Types.get_voter_weight_response;
	getweights: Types.get_voter_weight_response[];
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('sentiment.gm')
		});
	}
	action<T extends ActionNames>(
		name: T,
		data: ActionNameParams[T],
		options?: ActionOptions
	): Action {
		return super.action(name, data, options);
	}
	readonly<T extends ActionReturnNames>(
		name: T,
		data?: ActionNameParams[T]
	): ActionReturnValues[T] {
		return super.readonly(name, data) as unknown as ActionReturnValues[T];
	}
	table<T extends TableNames>(name: T, scope?: NameType): Table<RowType<T>> {
		return super.table(name, scope, TableMap[name]);
	}
}
