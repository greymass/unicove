/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Action, NameType } from '@wharfkit/antelope';
import {
	ABI,
	Asset,
	Blob,
	BlockTimestamp,
	Bytes,
	Checksum256,
	Float64,
	Int64,
	Name,
	Struct,
	TimePoint,
	TimePointSec,
	UInt16,
	UInt32,
	UInt64,
	UInt8
} from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yACoIYWJpX2hhc2gAAgVvd25lcgRuYW1lBGhhc2gLY2hlY2tzdW0yNTYHYWNjb3VudAABB2FjY291bnQEbmFtZQlhdmFpbGFibGUAAQdhY2NvdW50BG5hbWUIYmFsYW5jZXMAAwdhY2NvdW50BG5hbWUGdG9rZW5zEnRva2VuX2RlZmluaXRpb25bXQx6ZXJvYmFsYW5jZXMEYm9vbBVibG9ja2NoYWluX3BhcmFtZXRlcnMAERNtYXhfYmxvY2tfbmV0X3VzYWdlBnVpbnQ2NBp0YXJnZXRfYmxvY2tfbmV0X3VzYWdlX3BjdAZ1aW50MzIZbWF4X3RyYW5zYWN0aW9uX25ldF91c2FnZQZ1aW50MzIeYmFzZV9wZXJfdHJhbnNhY3Rpb25fbmV0X3VzYWdlBnVpbnQzMhBuZXRfdXNhZ2VfbGVld2F5BnVpbnQzMiNjb250ZXh0X2ZyZWVfZGlzY291bnRfbmV0X3VzYWdlX251bQZ1aW50MzIjY29udGV4dF9mcmVlX2Rpc2NvdW50X25ldF91c2FnZV9kZW4GdWludDMyE21heF9ibG9ja19jcHVfdXNhZ2UGdWludDMyGnRhcmdldF9ibG9ja19jcHVfdXNhZ2VfcGN0BnVpbnQzMhltYXhfdHJhbnNhY3Rpb25fY3B1X3VzYWdlBnVpbnQzMhltaW5fdHJhbnNhY3Rpb25fY3B1X3VzYWdlBnVpbnQzMhhtYXhfdHJhbnNhY3Rpb25fbGlmZXRpbWUGdWludDMyHmRlZmVycmVkX3RyeF9leHBpcmF0aW9uX3dpbmRvdwZ1aW50MzIVbWF4X3RyYW5zYWN0aW9uX2RlbGF5BnVpbnQzMhZtYXhfaW5saW5lX2FjdGlvbl9zaXplBnVpbnQzMhdtYXhfaW5saW5lX2FjdGlvbl9kZXB0aAZ1aW50MTYTbWF4X2F1dGhvcml0eV9kZXB0aAZ1aW50MTYKY29uZmlnX3JvdwAID3N5c3RlbV9jb250cmFjdARuYW1lFHN5c3RlbV9jb250cmFjdF9tc2lnBG5hbWUVc3lzdGVtX3Rva2VuX2NvbnRyYWN0BG5hbWUTc3lzdGVtX3Rva2VuX3N5bWJvbAZzeW1ib2wVc3lzdGVtX3JhbWNvcmVfc3ltYm9sBnN5bWJvbBFzeXN0ZW1fcmFtX3N5bWJvbAZzeW1ib2wRc3lzdGVtX3JleF9zeW1ib2wGc3ltYm9sEmdpZnRlZF9yYW1fZW5hYmxlZARib29sCWNvbm5lY3RvcgACB2JhbGFuY2UFYXNzZXQGd2VpZ2h0B2Zsb2F0NjQMY29udHJhY3RoYXNoAAEHYWNjb3VudARuYW1lE2RlbGVnYXRlZF9iYW5kd2lkdGgABARmcm9tBG5hbWUCdG8EbmFtZQpuZXRfd2VpZ2h0BWFzc2V0CmNwdV93ZWlnaHQFYXNzZXQLZGVsZWdhdGlvbnMAAQdhY2NvdW50BG5hbWUSZW9zaW9fZ2xvYmFsX3N0YXRlFWJsb2NrY2hhaW5fcGFyYW1ldGVycw0MbWF4X3JhbV9zaXplBnVpbnQ2NBh0b3RhbF9yYW1fYnl0ZXNfcmVzZXJ2ZWQGdWludDY0D3RvdGFsX3JhbV9zdGFrZQVpbnQ2NB1sYXN0X3Byb2R1Y2VyX3NjaGVkdWxlX3VwZGF0ZRRibG9ja190aW1lc3RhbXBfdHlwZRhsYXN0X3BlcnZvdGVfYnVja2V0X2ZpbGwKdGltZV9wb2ludA5wZXJ2b3RlX2J1Y2tldAVpbnQ2NA9wZXJibG9ja19idWNrZXQFaW50NjQTdG90YWxfdW5wYWlkX2Jsb2NrcwZ1aW50MzIVdG90YWxfYWN0aXZhdGVkX3N0YWtlBWludDY0G3RocmVzaF9hY3RpdmF0ZWRfc3Rha2VfdGltZQp0aW1lX3BvaW50G2xhc3RfcHJvZHVjZXJfc2NoZWR1bGVfc2l6ZQZ1aW50MTYadG90YWxfcHJvZHVjZXJfdm90ZV93ZWlnaHQHZmxvYXQ2NA9sYXN0X25hbWVfY2xvc2UUYmxvY2tfdGltZXN0YW1wX3R5cGUOZXhjaGFuZ2Vfc3RhdGUAAwZzdXBwbHkFYXNzZXQEYmFzZQljb25uZWN0b3IFcXVvdGUJY29ubmVjdG9yFGdldF9hY2NvdW50X3Jlc3BvbnNlAAoHYWNjb3VudARuYW1lDGNvbnRyYWN0aGFzaAtjaGVja3N1bTI1NgdiYWxhbmNlBWFzc2V0C2RlbGVnYXRpb25zFWRlbGVnYXRlZF9iYW5kd2lkdGhbXQlwcm9wb3NhbHMKcHJvcG9zYWxbXQZyZWZ1bmQOcmVmdW5kX3JlcXVlc3QGcmV4YmFsC3JleF9iYWxhbmNlB3JleGZ1bmQIcmV4X2Z1bmQEdm90ZQp2b3Rlcl9pbmZvCWdpZnRlZHJhbQpnaWZ0ZWRfcmFtFmdldF9hdmFpbGFibGVfcmVzcG9uc2UAAgdhY2NvdW50BG5hbWUJYXZhaWxhYmxlBGJvb2wUZ2V0X25ldHdvcmtfcmVzcG9uc2UABgZnbG9iYWwSZW9zaW9fZ2xvYmFsX3N0YXRlB3Bvd2VydXANcG93ZXJ1cF9zdGF0ZQNyYW0OZXhjaGFuZ2Vfc3RhdGUDcmV4CHJleF9wb29sBXRva2VuDHRva2VuX3N1cHBseQ5yYW1fZ2lmdF9ieXRlcwVpbnQ2NApnaWZ0ZWRfcmFtAAMGZ2lmdGVlBG5hbWUGZ2lmdGVyBG5hbWUJcmFtX2J5dGVzBWludDY0CWdpZnRlZHJhbQABB2FjY291bnQEbmFtZQZnbG9iYWwAAAduZXR3b3JrAAAZcGFpcl90aW1lX3BvaW50X3NlY19pbnQ2NAACBWZpcnN0DnRpbWVfcG9pbnRfc2VjBnNlY29uZAVpbnQ2NAdwb3dlcnVwAAANcG93ZXJ1cF9zdGF0ZQAFB3ZlcnNpb24FdWludDgDbmV0FnBvd2VydXBfc3RhdGVfcmVzb3VyY2UDY3B1FnBvd2VydXBfc3RhdGVfcmVzb3VyY2UMcG93ZXJ1cF9kYXlzBnVpbnQzMg9taW5fcG93ZXJ1cF9mZWUFYXNzZXQWcG93ZXJ1cF9zdGF0ZV9yZXNvdXJjZQAPB3ZlcnNpb24FdWludDgGd2VpZ2h0BWludDY0DHdlaWdodF9yYXRpbwVpbnQ2NBRhc3N1bWVkX3N0YWtlX3dlaWdodAVpbnQ2NBRpbml0aWFsX3dlaWdodF9yYXRpbwVpbnQ2NBN0YXJnZXRfd2VpZ2h0X3JhdGlvBWludDY0EWluaXRpYWxfdGltZXN0YW1wDnRpbWVfcG9pbnRfc2VjEHRhcmdldF90aW1lc3RhbXAOdGltZV9wb2ludF9zZWMIZXhwb25lbnQHZmxvYXQ2NApkZWNheV9zZWNzBnVpbnQzMgltaW5fcHJpY2UFYXNzZXQJbWF4X3ByaWNlBWFzc2V0C3V0aWxpemF0aW9uBWludDY0FGFkanVzdGVkX3V0aWxpemF0aW9uBWludDY0FXV0aWxpemF0aW9uX3RpbWVzdGFtcA50aW1lX3BvaW50X3NlYwhwcm9wb3NhbAADDXByb3Bvc2FsX25hbWUEbmFtZRJwYWNrZWRfdHJhbnNhY3Rpb24FYnl0ZXMSZWFybGllc3RfZXhlY190aW1lDHRpbWVfcG9pbnQ/JAlwcm9wb3NhbHMAAQdhY2NvdW50BG5hbWUDcmFtAAAGcmVmdW5kAAEHYWNjb3VudARuYW1lDnJlZnVuZF9yZXF1ZXN0AAQFb3duZXIEbmFtZQxyZXF1ZXN0X3RpbWUOdGltZV9wb2ludF9zZWMKbmV0X2Ftb3VudAVhc3NldApjcHVfYW1vdW50BWFzc2V0BXJlc2V0AAADcmV4AAALcmV4X2JhbGFuY2UABgd2ZXJzaW9uBXVpbnQ4BW93bmVyBG5hbWUKdm90ZV9zdGFrZQVhc3NldAtyZXhfYmFsYW5jZQVhc3NldAttYXR1cmVkX3JleAVpbnQ2NA5yZXhfbWF0dXJpdGllcxtwYWlyX3RpbWVfcG9pbnRfc2VjX2ludDY0W10IcmV4X2Z1bmQAAwd2ZXJzaW9uBXVpbnQ4BW93bmVyBG5hbWUHYmFsYW5jZQVhc3NldAhyZXhfcG9vbAAIB3ZlcnNpb24FdWludDgKdG90YWxfbGVudAVhc3NldAx0b3RhbF91bmxlbnQFYXNzZXQKdG90YWxfcmVudAVhc3NldA50b3RhbF9sZW5kYWJsZQVhc3NldAl0b3RhbF9yZXgFYXNzZXQQbmFtZWJpZF9wcm9jZWVkcwVhc3NldAhsb2FuX251bQZ1aW50NjQGcmV4YmFsAAEHYWNjb3VudARuYW1lB3JleGZ1bmQAAQdhY2NvdW50BG5hbWUJc2V0Y29uZmlnAAgPc3lzdGVtX2NvbnRyYWN0BG5hbWUUc3lzdGVtX2NvbnRyYWN0X21zaWcEbmFtZRVzeXN0ZW1fdG9rZW5fY29udHJhY3QEbmFtZRNzeXN0ZW1fdG9rZW5fc3ltYm9sBnN5bWJvbBVzeXN0ZW1fcmFtY29yZV9zeW1ib2wGc3ltYm9sEXN5c3RlbV9yYW1fc3ltYm9sBnN5bWJvbBFzeXN0ZW1fcmV4X3N5bWJvbAZzeW1ib2wSZ2lmdGVkX3JhbV9lbmFibGVkBGJvb2wGc3VwcGx5AAEDZGVmEHRva2VuX2RlZmluaXRpb24QdG9rZW5fZGVmaW5pdGlvbgACCGNvbnRyYWN0BG5hbWUGc3ltYm9sBnN5bWJvbAx0b2tlbl9zdXBwbHkABQNkZWYQdG9rZW5fZGVmaW5pdGlvbgtjaXJjdWxhdGluZwVhc3NldAZsb2NrZWQFYXNzZXQDbWF4BWFzc2V0BnN1cHBseQVhc3NldAp2b3Rlcl9pbmZvAAoFb3duZXIEbmFtZQVwcm94eQRuYW1lCXByb2R1Y2VycwZuYW1lW10Gc3Rha2VkBWludDY0EGxhc3Rfdm90ZV93ZWlnaHQHZmxvYXQ2NBNwcm94aWVkX3ZvdGVfd2VpZ2h0B2Zsb2F0NjQIaXNfcHJveHkEYm9vbAZmbGFnczEGdWludDMyCXJlc2VydmVkMgZ1aW50MzIJcmVzZXJ2ZWQzBWFzc2V0BXZvdGVzAAEHYWNjb3VudARuYW1lBHdpcGUAABQAAAAgT00RMgdhY2NvdW506QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgQWNjb3VudCBTdGF0ZScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCB0aGUgY3VycmVudCBzdGF0ZSBvZiBhbiBhY2NvdW50LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAUPGY6Mw2CWF2YWlsYWJsZfEBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdDaGVjayBOYW1lIEF2YWlsYWJsZScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gY2hlY2tzIHRoZSBhdmFpbGFiaWxpdHkgb2YgYW4gYWNjb3VudCBuYW1lLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAFihaaI5CGJhbGFuY2VzgwItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgQmFsYW5jZXMnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIGxvYWQgdGhlIHRva2VuIGJhbGFuY2VzIG9mIHRoZSBwcm92aWRlZCB0b2tlbiBjb250cmFjdHMgYW5kIHN5bWJvbHMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0t0LBpGZmbJ0UMY29udHJhY3RoYXNo+QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgQ29udHJhY3QgSGFzaCcKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCB0aGUgaGFzaCBvZiB0aGUgY29udHJhY3QgZGVwbG95ZWQgdG8gYW4gYWNjb3VudC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0A8KQuG6aiSgtkZWxlZ2F0aW9uc+oBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIERlbGVnYXRpb25zJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIGFueSB0b2tlbnMgZGVsZWdhdGVkIGJ5IGFuIGFjY291bnQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAACQ5iaVl2MJZ2lmdGVkcmFt6QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgR2lmdGVkIFJBTScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCB0aGUgZ2lmdGVkIFJBTSBzdGF0ZSBvZiBhbiBhY2NvdW50LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAABEc2hkBmdsb2JhbNoBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIEdsb2JhbCBTdGF0ZScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCBnbG9iYWwgc3RhdGUgZGF0YS4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAAXsqzmgduZXR3b3Jr6gEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgTmV0d29yayBTdGF0ZScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgbmV0d29yay4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAACg6qs4rQdwb3dlcnVw+wEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgUG93ZXJ1cCBTdGF0ZScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgcG93ZXJ1cCBzeXN0ZW0gY29udHJhY3RzLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAwNFgWumtCXByb3Bvc2Fsc4ECLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIEFjY291bnQgUHJvcG9zYWxzJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIG11bHRpc2lnIHByb3Bvc2FscyB0aGF0IHdlcmUgcHJvcG9zZWQgYnkgYW4gYWNjb3VudC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAAAACkuQNyYW3wAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnTG9hZCBSQU0gTWFya2V0IFN0YXRlJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBSQU0gTWFya2V0LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAACkqZe6BnJlZnVuZOUBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIFJlZnVuZCcKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gZmluZCBhbnkgcGVuZGluZyByZWZ1bmRzIGZvciBhbiBhY2NvdW50LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAACArLC6BXJlc2V07AEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0RFQlVHOiBSZXNldCBDb250cmFjdCBTdGF0ZScKc3VtbWFyeTogJ0RFQlVHOiBSZXNldHMgdGhlIGNvbnRyYWN0IHN0YXRlIHRvIGRlZmF1bHQgdmFsdWVzLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAAAAALq6A3JleOsBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIFJFWCBTdGF0ZScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgUkVYIGNvbnRyYWN0LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAABEc7q6BnJleGJhbP4BLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIFJFWCBCYWxhbmNlJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSBFT1MgYmFsYW5jZSBvZiBhbiBhY2NvdW50IGlkbGUgaW4gdGhlIFJFWCBjb250cmFjdC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAgTb26ugdyZXhmdW5k9QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgUkVYIFN0YXRlJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSBSRVggc3RhdGUgb2YgYW4gYWNjb3VudCBpbiB0aGUgUkVYIGNvbnRyYWN0LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAYG5NirLCCXNldGNvbmZpZ5UCLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdTZXQgQ29udHJhY3QgQ29uZmlndXJhdGlvbicKc3VtbWFyeTogJ01haW50YWluZXIgYWN0aW9uIHRvIHNldCB0aGUgdmFsdWVzIG9mIHRoZSBjb25maWcgdGFibGUgdG8gdXBkYXRlIGhvdyB0aGlzIGNvbnRyYWN0IG9wZXJhdGVzLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAAD4WKvGBnN1cHBseeoBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIFRva2VuIFN1cHBseScKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCB0aGUgc3VwcGx5IGluZm9ybWF0aW9uIG9mIGEgdG9rZW4uJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAACsMt0Fdm90ZXPmAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnTG9hZCBBY2NvdW50IFZvdGVzJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSB2b3RlcyBjYXN0IGJ5IGFuIGFjY291bnQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAACgquMEd2lwZdkBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdERUJVRzogV2lwZSBDb250cmFjdCBEYXRhJwpzdW1tYXJ5OiAnREVCVUc6IFJlbW92ZXMgYWxsIGNvbnRyYWN0IHN0YXRlLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQEAAAAAMLcmRQNpNjQAAApjb25maWdfcm93AQNhcGkDYXBpAAAAEQAAACBPTREyFGdldF9hY2NvdW50X3Jlc3BvbnNlAABQ8ZjozDYWZ2V0X2F2YWlsYWJsZV9yZXNwb25zZQAAAFihaaI5B2Fzc2V0W13QsGkZmZsnRQhhYmlfaGFzaADwpC4bpqJKFWRlbGVnYXRlZF9iYW5kd2lkdGhbXQAAkOYmlZdjCmdpZnRlZF9yYW0AAAAARHNoZBJlb3Npb19nbG9iYWxfc3RhdGUAAAAAXsqzmhRnZXRfbmV0d29ya19yZXNwb25zZQAAAKDqqzitDXBvd2VydXBfc3RhdGUAAMDRYFrprQpwcm9wb3NhbFtdAAAAAAAApLkOZXhjaGFuZ2Vfc3RhdGUAAAAApKmXug5yZWZ1bmRfcmVxdWVzdAAAAAAAALq6CHJleF9wb29sAAAAAERzuroLcmV4X2JhbGFuY2UAAAAgTb26ughyZXhfZnVuZAAAAAD4WKvGDHRva2VuX3N1cHBseQAAAAAArDLdCnZvdGVyX2luZm8='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('abi_hash')
	export class abi_hash extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Checksum256)
		declare hash: Checksum256;
	}
	@Struct.type('account')
	export class account extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('available')
	export class available extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('token_definition')
	export class token_definition extends Struct {
		@Struct.field(Name)
		declare contract: Name;
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
	}
	@Struct.type('balances')
	export class balances extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(token_definition, { array: true })
		declare tokens: token_definition[];
		@Struct.field('bool')
		declare zerobalances: boolean;
	}
	@Struct.type('blockchain_parameters')
	export class blockchain_parameters extends Struct {
		@Struct.field(UInt64)
		declare max_block_net_usage: UInt64;
		@Struct.field(UInt32)
		declare target_block_net_usage_pct: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_net_usage: UInt32;
		@Struct.field(UInt32)
		declare base_per_transaction_net_usage: UInt32;
		@Struct.field(UInt32)
		declare net_usage_leeway: UInt32;
		@Struct.field(UInt32)
		declare context_free_discount_net_usage_num: UInt32;
		@Struct.field(UInt32)
		declare context_free_discount_net_usage_den: UInt32;
		@Struct.field(UInt32)
		declare max_block_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare target_block_cpu_usage_pct: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare min_transaction_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_lifetime: UInt32;
		@Struct.field(UInt32)
		declare deferred_trx_expiration_window: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_delay: UInt32;
		@Struct.field(UInt32)
		declare max_inline_action_size: UInt32;
		@Struct.field(UInt16)
		declare max_inline_action_depth: UInt16;
		@Struct.field(UInt16)
		declare max_authority_depth: UInt16;
	}
	@Struct.type('config_row')
	export class config_row extends Struct {
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(Name)
		declare system_contract_msig: Name;
		@Struct.field(Name)
		declare system_token_contract: Name;
		@Struct.field(Asset.Symbol)
		declare system_token_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ramcore_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ram_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_rex_symbol: Asset.Symbol;
		@Struct.field('bool')
		declare gifted_ram_enabled: boolean;
	}
	@Struct.type('connector')
	export class connector extends Struct {
		@Struct.field(Asset)
		declare balance: Asset;
		@Struct.field(Float64)
		declare weight: Float64;
	}
	@Struct.type('contracthash')
	export class contracthash extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('delegated_bandwidth')
	export class delegated_bandwidth extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Asset)
		declare net_weight: Asset;
		@Struct.field(Asset)
		declare cpu_weight: Asset;
	}
	@Struct.type('delegations')
	export class delegations extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('eosio_global_state')
	export class eosio_global_state extends blockchain_parameters {
		@Struct.field(UInt64)
		declare max_ram_size: UInt64;
		@Struct.field(UInt64)
		declare total_ram_bytes_reserved: UInt64;
		@Struct.field(Int64)
		declare total_ram_stake: Int64;
		@Struct.field(BlockTimestamp)
		declare last_producer_schedule_update: BlockTimestamp;
		@Struct.field(TimePoint)
		declare last_pervote_bucket_fill: TimePoint;
		@Struct.field(Int64)
		declare pervote_bucket: Int64;
		@Struct.field(Int64)
		declare perblock_bucket: Int64;
		@Struct.field(UInt32)
		declare total_unpaid_blocks: UInt32;
		@Struct.field(Int64)
		declare total_activated_stake: Int64;
		@Struct.field(TimePoint)
		declare thresh_activated_stake_time: TimePoint;
		@Struct.field(UInt16)
		declare last_producer_schedule_size: UInt16;
		@Struct.field(Float64)
		declare total_producer_vote_weight: Float64;
		@Struct.field(BlockTimestamp)
		declare last_name_close: BlockTimestamp;
	}
	@Struct.type('exchange_state')
	export class exchange_state extends Struct {
		@Struct.field(Asset)
		declare supply: Asset;
		@Struct.field(connector)
		declare base: connector;
		@Struct.field(connector)
		declare quote: connector;
	}
	@Struct.type('proposal')
	export class proposal extends Struct {
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(Bytes)
		declare packed_transaction: Bytes;
		@Struct.field(TimePoint, { optional: true })
		declare earliest_exec_time?: TimePoint;
	}
	@Struct.type('refund_request')
	export class refund_request extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(TimePointSec)
		declare request_time: TimePointSec;
		@Struct.field(Asset)
		declare net_amount: Asset;
		@Struct.field(Asset)
		declare cpu_amount: Asset;
	}
	@Struct.type('pair_time_point_sec_int64')
	export class pair_time_point_sec_int64 extends Struct {
		@Struct.field(TimePointSec)
		declare first: TimePointSec;
		@Struct.field(Int64)
		declare second: Int64;
	}
	@Struct.type('rex_balance')
	export class rex_balance extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare vote_stake: Asset;
		@Struct.field(Asset)
		declare rex_balance: Asset;
		@Struct.field(Int64)
		declare matured_rex: Int64;
		@Struct.field(pair_time_point_sec_int64, { array: true })
		declare rex_maturities: pair_time_point_sec_int64[];
	}
	@Struct.type('rex_fund')
	export class rex_fund extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare balance: Asset;
	}
	@Struct.type('voter_info')
	export class voter_info extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare proxy: Name;
		@Struct.field(Name, { array: true })
		declare producers: Name[];
		@Struct.field(Int64)
		declare staked: Int64;
		@Struct.field(Float64)
		declare last_vote_weight: Float64;
		@Struct.field(Float64)
		declare proxied_vote_weight: Float64;
		@Struct.field('bool')
		declare is_proxy: boolean;
		@Struct.field(UInt32)
		declare flags1: UInt32;
		@Struct.field(UInt32)
		declare reserved2: UInt32;
		@Struct.field(Asset)
		declare reserved3: Asset;
	}
	@Struct.type('gifted_ram')
	export class gifted_ram extends Struct {
		@Struct.field(Name)
		declare giftee: Name;
		@Struct.field(Name)
		declare gifter: Name;
		@Struct.field(Int64)
		declare ram_bytes: Int64;
	}
	@Struct.type('get_account_response')
	export class get_account_response extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Checksum256)
		declare contracthash: Checksum256;
		@Struct.field(Asset)
		declare balance: Asset;
		@Struct.field(delegated_bandwidth, { array: true })
		declare delegations: delegated_bandwidth[];
		@Struct.field(proposal, { array: true })
		declare proposals: proposal[];
		@Struct.field(refund_request)
		declare refund: refund_request;
		@Struct.field(rex_balance)
		declare rexbal: rex_balance;
		@Struct.field(rex_fund)
		declare rexfund: rex_fund;
		@Struct.field(voter_info)
		declare vote: voter_info;
		@Struct.field(gifted_ram)
		declare giftedram: gifted_ram;
	}
	@Struct.type('get_available_response')
	export class get_available_response extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field('bool')
		declare available: boolean;
	}
	@Struct.type('powerup_state_resource')
	export class powerup_state_resource extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Int64)
		declare weight: Int64;
		@Struct.field(Int64)
		declare weight_ratio: Int64;
		@Struct.field(Int64)
		declare assumed_stake_weight: Int64;
		@Struct.field(Int64)
		declare initial_weight_ratio: Int64;
		@Struct.field(Int64)
		declare target_weight_ratio: Int64;
		@Struct.field(TimePointSec)
		declare initial_timestamp: TimePointSec;
		@Struct.field(TimePointSec)
		declare target_timestamp: TimePointSec;
		@Struct.field(Float64)
		declare exponent: Float64;
		@Struct.field(UInt32)
		declare decay_secs: UInt32;
		@Struct.field(Asset)
		declare min_price: Asset;
		@Struct.field(Asset)
		declare max_price: Asset;
		@Struct.field(Int64)
		declare utilization: Int64;
		@Struct.field(Int64)
		declare adjusted_utilization: Int64;
		@Struct.field(TimePointSec)
		declare utilization_timestamp: TimePointSec;
	}
	@Struct.type('powerup_state')
	export class powerup_state extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(powerup_state_resource)
		declare net: powerup_state_resource;
		@Struct.field(powerup_state_resource)
		declare cpu: powerup_state_resource;
		@Struct.field(UInt32)
		declare powerup_days: UInt32;
		@Struct.field(Asset)
		declare min_powerup_fee: Asset;
	}
	@Struct.type('rex_pool')
	export class rex_pool extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Asset)
		declare total_lent: Asset;
		@Struct.field(Asset)
		declare total_unlent: Asset;
		@Struct.field(Asset)
		declare total_rent: Asset;
		@Struct.field(Asset)
		declare total_lendable: Asset;
		@Struct.field(Asset)
		declare total_rex: Asset;
		@Struct.field(Asset)
		declare namebid_proceeds: Asset;
		@Struct.field(UInt64)
		declare loan_num: UInt64;
	}
	@Struct.type('token_supply')
	export class token_supply extends Struct {
		@Struct.field(token_definition)
		declare def: token_definition;
		@Struct.field(Asset)
		declare circulating: Asset;
		@Struct.field(Asset)
		declare locked: Asset;
		@Struct.field(Asset)
		declare max: Asset;
		@Struct.field(Asset)
		declare supply: Asset;
	}
	@Struct.type('get_network_response')
	export class get_network_response extends Struct {
		@Struct.field(eosio_global_state)
		declare global: eosio_global_state;
		@Struct.field(powerup_state)
		declare powerup: powerup_state;
		@Struct.field(exchange_state)
		declare ram: exchange_state;
		@Struct.field(rex_pool)
		declare rex: rex_pool;
		@Struct.field(token_supply)
		declare token: token_supply;
		@Struct.field(Int64)
		declare ram_gift_bytes: Int64;
	}
	@Struct.type('giftedram')
	export class giftedram extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('global')
	export class global extends Struct {}
	@Struct.type('network')
	export class network extends Struct {}
	@Struct.type('powerup')
	export class powerup extends Struct {}
	@Struct.type('proposals')
	export class proposals extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('ram')
	export class ram extends Struct {}
	@Struct.type('refund')
	export class refund extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('reset')
	export class reset extends Struct {}
	@Struct.type('rex')
	export class rex extends Struct {}
	@Struct.type('rexbal')
	export class rexbal extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('rexfund')
	export class rexfund extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('setconfig')
	export class setconfig extends Struct {
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(Name)
		declare system_contract_msig: Name;
		@Struct.field(Name)
		declare system_token_contract: Name;
		@Struct.field(Asset.Symbol)
		declare system_token_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ramcore_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ram_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_rex_symbol: Asset.Symbol;
		@Struct.field('bool')
		declare gifted_ram_enabled: boolean;
	}
	@Struct.type('supply')
	export class supply extends Struct {
		@Struct.field(token_definition)
		declare def: token_definition;
	}
	@Struct.type('votes')
	export class votes extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('wipe')
	export class wipe extends Struct {}
}
export const TableMap = {
	config: Types.config_row
};
export interface TableTypes {
	config: Types.config_row;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export interface ActionParams {}
export namespace ActionParams {
	export namespace Type {
		export interface token_definition {
			contract: NameType;
			symbol: Asset.SymbolType;
		}
	}
	export interface account {
		account: NameType;
	}
	export interface available {
		account: NameType;
	}
	export interface balances {
		account: NameType;
		tokens: Type.token_definition[];
		zerobalances: boolean;
	}
	export interface contracthash {
		account: NameType;
	}
	export interface delegations {
		account: NameType;
	}
	export interface giftedram {
		account: NameType;
	}
	export interface global {}
	export interface network {}
	export interface powerup {}
	export interface proposals {
		account: NameType;
	}
	export interface ram {}
	export interface refund {
		account: NameType;
	}
	export interface reset {}
	export interface rex {}
	export interface rexbal {
		account: NameType;
	}
	export interface rexfund {
		account: NameType;
	}
	export interface setconfig {
		system_contract: NameType;
		system_contract_msig: NameType;
		system_token_contract: NameType;
		system_token_symbol: Asset.SymbolType;
		system_ramcore_symbol: Asset.SymbolType;
		system_ram_symbol: Asset.SymbolType;
		system_rex_symbol: Asset.SymbolType;
		gifted_ram_enabled: boolean;
	}
	export interface supply {
		def: Type.token_definition;
	}
	export interface votes {
		account: NameType;
	}
	export interface wipe {}
}
export const ActionParams: ActionParams = {} as ActionParams;
export interface ActionNameParams {
	account: ActionParams.account;
	available: ActionParams.available;
	balances: ActionParams.balances;
	contracthash: ActionParams.contracthash;
	delegations: ActionParams.delegations;
	giftedram: ActionParams.giftedram;
	global: ActionParams.global;
	network: ActionParams.network;
	powerup: ActionParams.powerup;
	proposals: ActionParams.proposals;
	ram: ActionParams.ram;
	refund: ActionParams.refund;
	reset: ActionParams.reset;
	rex: ActionParams.rex;
	rexbal: ActionParams.rexbal;
	rexfund: ActionParams.rexfund;
	setconfig: ActionParams.setconfig;
	supply: ActionParams.supply;
	votes: ActionParams.votes;
	wipe: ActionParams.wipe;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	account: Types.get_account_response;
	available: Types.get_available_response;
	balances: Asset[];
	contracthash: Types.abi_hash;
	delegations: Types.delegated_bandwidth[];
	giftedram: Types.gifted_ram;
	global: Types.eosio_global_state;
	network: Types.get_network_response;
	powerup: Types.powerup_state;
	proposals: Types.proposal[];
	ram: Types.exchange_state;
	refund: Types.refund_request;
	rex: Types.rex_pool;
	rexbal: Types.rex_balance;
	rexfund: Types.rex_fund;
	supply: Types.token_supply;
	votes: Types.voter_info;
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('unicove.gm')
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
