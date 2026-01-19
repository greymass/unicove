import type { Action, NameType, UInt32Type, UInt8Type } from '@wharfkit/antelope';
import { ABI, Blob, Int64, Name, Struct, UInt32, UInt8 } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yACcQYWNjb3VudF92b3RlX3JvdwADBXZvdGVyBG5hbWUHYWNjb3VudARuYW1lCXZvdGVfdHlwZQV1aW50OAtidWxrcm12b3RlcwACCHRvcGljX2lkBG5hbWUJbnVtX3ZvdGVzBnVpbnQzMgpjaGFuZ2V2b3RlAAMFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lCXZvdGVfdHlwZQV1aW50OApjb25maWdfcm93AAIHZW5hYmxlZARib29sD3N5c3RlbV9jb250cmFjdARuYW1lC2NyZWF0ZXRvcGljAAICaWQEbmFtZQtkZXNjcmlwdGlvbgZzdHJpbmcLZGVsZXRldG9waWMAAQJpZARuYW1lB2Rpc2FibGUAAAZlbmFibGUAABlnZXRfYWNjb3VudF92b3RlX3Jlc3BvbnNlAAMFdm90ZXIEbmFtZQdhY2NvdW50BG5hbWUJdm90ZV90eXBlBXVpbnQ4FmdldF9tc2lnX3ZvdGVfcmVzcG9uc2UABAV2b3RlcgRuYW1lCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lCXZvdGVfdHlwZQV1aW50OBJnZXRfdG9waWNfcmVzcG9uc2UAAgJpZARuYW1lC2Rlc2NyaXB0aW9uBnN0cmluZxdnZXRfdG9waWNfdm90ZV9yZXNwb25zZQADBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQl2b3RlX3R5cGUFdWludDgZZ2V0X3ZvdGVyX3dlaWdodF9yZXNwb25zZQACBXZvdGVyBG5hbWUGd2VpZ2h0BWludDY0C2dldGFjY3R2b3RlAAIFdm90ZXIEbmFtZQdhY2NvdW50BG5hbWUKZ2V0YWN0dnRycwABB2FjY291bnQEbmFtZQtnZXRtc2lndm90ZQADBXZvdGVyBG5hbWUIcHJvcG9zZXIEbmFtZQ1wcm9wb3NhbF9uYW1lBG5hbWULZ2V0bXNpZ3Z0cnMAAghwcm9wb3NlcgRuYW1lDXByb3Bvc2FsX25hbWUEbmFtZQhnZXR0b3BpYwABAmlkBG5hbWUJZ2V0dG9waWNzAAAMZ2V0dG9waWN2b3RlAAIFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lDGdldHRvcGljdnRycwABCHRvcGljX2lkBG5hbWUHZ2V0dm90ZQACBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQlnZXR2b3RlcnMAAQh0b3BpY19pZARuYW1lCWdldHdlaWdodAABBXZvdGVyBG5hbWUKZ2V0d2VpZ2h0cwABBnZvdGVycwZuYW1lW10NbXNpZ192b3RlX3JvdwAEBXZvdGVyBG5hbWUIcHJvcG9zZXIEbmFtZQ1wcm9wb3NhbF9uYW1lBG5hbWUJdm90ZV90eXBlBXVpbnQ4CnJlbW92ZXZvdGUAAgV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUFcmVzZXQAAApybWFjY3R2b3RlAAIFdm90ZXIEbmFtZQdhY2NvdW50BG5hbWUKcm1tc2lndm90ZQADBXZvdGVyBG5hbWUIcHJvcG9zZXIEbmFtZQ1wcm9wb3NhbF9uYW1lBG5hbWULcm10b3BpY3ZvdGUAAgV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJc2V0Y29uZmlnAAEGY29uZmlnCmNvbmZpZ19yb3cJdG9waWNfcm93AAICaWQEbmFtZQtkZXNjcmlwdGlvbgZzdHJpbmcOdG9waWNfdm90ZV9yb3cAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4C3VwZGF0ZXRvcGljAAICaWQEbmFtZQtkZXNjcmlwdGlvbgZzdHJpbmcEdm90ZQADBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQl2b3RlX3R5cGUFdWludDgLdm90ZWFjY291bnQAAwV2b3RlcgRuYW1lB2FjY291bnQEbmFtZQl2b3RlX3R5cGUFdWludDgIdm90ZW1zaWcABAV2b3RlcgRuYW1lCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lCXZvdGVfdHlwZQV1aW50OAl2b3RldG9waWMAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4HQCwynTLC6M+C2J1bGtybXZvdGVzsAItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0J1bGsgUmVtb3ZlIFZvdGVzJwpzdW1tYXJ5OiAnTWFpbnRhaW5lciBhY3Rpb24gdG8gcmVtb3ZlIG11bHRpcGxlIHZvdGVzIGZyb20gYSB0b3BpYyBmb3IgYWRtaW5pc3RyYXRpdmUgcHVycG9zZXMuIFJlbW92ZXMgdXAgdG8gdGhlIHNwZWNpZmllZCBudW1iZXIgb2Ygdm90ZXMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAIDKdCs2TUMKY2hhbmdldm90ZYkCLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdDaGFuZ2UgVm90ZScKc3VtbWFyeTogJ0FsbG93cyBhIHVzZXIgdG8gY2hhbmdlIHRoZWlyIGV4aXN0aW5nIHZvdGUgb24gYSB0b3BpYyBmcm9tIHN1cHBvcnQgdG8gb3Bwb3NpdGlvbiBvciB2aWNlIHZlcnNhLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQCQqzSrbNRFC2NyZWF0ZXRvcGlj5AEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0NyZWF0ZSBUb3BpYycKc3VtbWFyeTogJ0NyZWF0ZXMgYSBuZXcgdG9waWMgd2l0aCB0aGUgc3BlY2lmaWVkIElEIGFuZCBkZXNjcmlwdGlvbi4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AkKs0q6yiSgtkZWxldGV0b3BpY9YBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdEZWxldGUgVG9waWMnCnN1bW1hcnk6ICdEZWxldGVzIGFuIGV4aXN0aW5nIHRvcGljIGZyb20gdGhlIHJlZ2lzdHJ5LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAEDFY7BLB2Rpc2FibGWFAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnRGlzYWJsZSBDb250cmFjdCcKc3VtbWFyeTogJ01haW50YWluZXIgYWN0aW9uIHRvIGRpc2FibGUgdGhlIGNvbnRyYWN0LCBwcmV2ZW50aW5nIHVzZXIgYWN0aW9ucyBmcm9tIGJlaW5nIGV4ZWN1dGVkLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAACoeMxUBmVuYWJsZfwBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdFbmFibGUgQ29udHJhY3QnCnN1bW1hcnk6ICdNYWludGFpbmVyIGFjdGlvbiB0byBlbmFibGUgdGhlIGNvbnRyYWN0LCBhbGxvd2luZyB1c2VyIGFjdGlvbnMgdG8gYmUgZXhlY3V0ZWQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAFSmOyNksmILZ2V0YWNjdHZvdGUAAAC+eWdksmIKZ2V0YWN0dnRycwAAVKabOSyzYgtnZXRtc2lndm90ZQAA8M2bOSyzYgtnZXRtc2lndnRycwAAAADIVZqzYghnZXR0b3BpY9YBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgVG9waWMnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIGEgdG9waWMgYnkgaXRzIElELicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAwMhVmrNiCWdldHRvcGljc+YBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgQWxsIFRvcGljcycKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gcmV0cmlldmUgYWxsIHRvcGljcyBmcm9tIHRoZSByZWdpc3RyeS4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS2gMt3IVZqzYgxnZXR0b3BpY3ZvdGUAgG/eyFWas2IMZ2V0dG9waWN2dHJzAAAAAEBlurNiB2dldHZvdGXmAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IFZvdGUnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIGEgc3BlY2lmaWMgdXNlclwncyB2b3RlIG9uIGEgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAADAV2W6s2IJZ2V0dm90ZXJz+QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0dldCBBbGwgVm90ZXJzJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byByZXRyaWV2ZSBhbGwgdm90ZXJzIGFuZCB0aGVpciB2b3RlcyBmb3IgYSBzcGVjaWZpYyB0b3BpYy4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAMiNOcWzYglnZXR3ZWlnaHScAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IFZvdGVyIFdlaWdodCcKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gcmV0cmlldmUgdGhlIHZvdGluZyB3ZWlnaHQgb2YgYSB2b3RlciBiYXNlZCBvbiB0aGVpciBzdGFrZWQgdG9rZW5zIGluIHRoZSBzeXN0ZW0gY29udHJhY3QuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAADOjTnFs2IKZ2V0d2VpZ2h0c68CLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgTXVsdGlwbGUgVm90ZXIgV2VpZ2h0cycKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gcmV0cmlldmUgdGhlIHZvdGluZyB3ZWlnaHRzIG9mIG11bHRpcGxlIHZvdGVycyBiYXNlZCBvbiB0aGVpciBzdGFrZWQgdG9rZW5zIGluIHRoZSBzeXN0ZW0gY29udHJhY3QuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAIDKdKtNpboKcmVtb3Zldm90ZdkBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdSZW1vdmUgVm90ZScKc3VtbWFyeTogJ0FsbG93cyBhIHVzZXIgdG8gcmVtb3ZlIHRoZWlyIHZvdGUgZnJvbSBhIHRvcGljLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAACArLC6BXJlc2V0AACAynRnhIy8CnJtYWNjdHZvdGUAAIDKdDOHpbwKcm1tc2lndm90ZQAAVKYbuUqzvAtybXRvcGljdm90ZQAAAGBuTYqywglzZXRjb25maWeVAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnU2V0IENvbnRyYWN0IENvbmZpZ3VyYXRpb24nCnN1bW1hcnk6ICdNYWludGFpbmVyIGFjdGlvbiB0byBzZXQgdGhlIHZhbHVlcyBvZiB0aGUgY29uZmlnIHRhYmxlIHRvIHVwZGF0ZSBob3cgdGhpcyBjb250cmFjdCBvcGVyYXRlcy4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AkKs0q2xS1Qt1cGRhdGV0b3BpY9cBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdVcGRhdGUgVG9waWMnCnN1bW1hcnk6ICdVcGRhdGVzIHRoZSBkZXNjcmlwdGlvbiBvZiBhbiBleGlzdGluZyB0b3BpYy4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAAAKAy3QR2b3Rl9wEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ1ZvdGUgb24gVG9waWMnCnN1bW1hcnk6ICdBbGxvd3MgYSB1c2VyIHRvIGV4cHJlc3MgdGhlaXIgc2VudGltZW50IChzdXBwb3J0IG9yIG9wcG9zaXRpb24pIG9uIGEgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAPLUFCGjMt0Ldm90ZWFjY291bnQAAAAAzGGpMt0Idm90ZW1zaWcAAABArtKsMt0Jdm90ZXRvcGljAAWAVaY7T00RMgNpNjQAABBhY2NvdW50X3ZvdGVfcm93AAAAADC3JkUDaTY0AAAKY29uZmlnX3JvdwAAwCrTzRyWA2k2NAAADW1zaWdfdm90ZV9yb3cAAAAAYOQqzQNpNjQAAAl0b3BpY19yb3cAAAAAAKwy3QNpNjQAAA50b3BpY192b3RlX3JvdwEJc2VudGltZW50CXNlbnRpbWVudAAAAAwAVKY7I2SyYhlnZXRfYWNjb3VudF92b3RlX3Jlc3BvbnNlAAC+eWdksmIbZ2V0X2FjY291bnRfdm90ZV9yZXNwb25zZVtdAFSmmzkss2IWZ2V0X21zaWdfdm90ZV9yZXNwb25zZQDwzZs5LLNiGGdldF9tc2lnX3ZvdGVfcmVzcG9uc2VbXQAAAMhVmrNiEmdldF90b3BpY19yZXNwb25zZQAAwMhVmrNiFGdldF90b3BpY19yZXNwb25zZVtdoDLdyFWas2IXZ2V0X3RvcGljX3ZvdGVfcmVzcG9uc2WAb97IVZqzYhlnZXRfdG9waWNfdm90ZV9yZXNwb25zZVtdAAAAQGW6s2IXZ2V0X3RvcGljX3ZvdGVfcmVzcG9uc2UAAMBXZbqzYhlnZXRfdG9waWNfdm90ZV9yZXNwb25zZVtdAADIjTnFs2IZZ2V0X3ZvdGVyX3dlaWdodF9yZXNwb25zZQAAzo05xbNiG2dldF92b3Rlcl93ZWlnaHRfcmVzcG9uc2VbXQ=='
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
	@Struct.type('config_row')
	export class config_row extends Struct {
		@Struct.field('bool')
		declare enabled: boolean;
		@Struct.field(Name)
		declare system_contract: Name;
	}
	@Struct.type('createtopic')
	export class createtopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
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
		@Struct.field(config_row)
		declare config: config_row;
	}
	@Struct.type('topic_row')
	export class topic_row extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
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
}
export const TableMap = {
	accountvotes: Types.account_vote_row,
	config: Types.config_row,
	msigvotes: Types.msig_vote_row,
	topics: Types.topic_row,
	votes: Types.topic_vote_row
};
export interface TableTypes {
	accountvotes: Types.account_vote_row;
	config: Types.config_row;
	msigvotes: Types.msig_vote_row;
	topics: Types.topic_row;
	votes: Types.topic_vote_row;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {
		export interface config_row {
			enabled: boolean;
			system_contract: NameType;
		}
	}
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
		id: NameType;
		description: string;
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
		config: Type.config_row;
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
