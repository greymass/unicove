import { Resource } from '@wharfkit/account';
import { ResourceType } from './types';
import { calSize, calUsagePer, getName, getUnit } from './utils';

export class ResourceState {
	private resourceType: ResourceType;
	public name: string;
	public unit: string;
	public availableSize = $state(0);
	public usedSize = $state(0);
	public maxSize = $state(0);
	public usagePerc = $state(100);

	constructor(type: ResourceType) {
		this.resourceType = type;
		this.name = getName(type);
		this.unit = getUnit(type);
	}

	setResource(resource: Resource | undefined) {
		if (resource) {
			this.availableSize = calSize(Number(resource.available));
			this.usedSize = calSize(Number(resource.used));
			this.maxSize = calSize(Number(resource.max));
			this.usagePerc = calUsagePer(Number(resource.used), Number(resource.max));
		} else {
			this.availableSize = 0;
			this.usedSize = 0;
			this.maxSize = 0;
			this.usagePerc = 100;
		}
	}
}
