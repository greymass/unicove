import { ResourceType } from "./types.svelte";

export const calSize = (available: number) => {
    let size = 0;
    if (!isNaN(available)) size = available / 1000;
    return Number(size.toFixed(2));
};

export const calUsagePer = (used: number, max: number) => {
    let percentage = 100;
    if (isNaN(max) || isNaN(used)) {
        percentage = 0;
    } else if (max === 0) {
        percentage = 100;
    } else {
        percentage = (used / max) * 100;
        if (percentage > 100) {
            percentage = 100;
        }
    }
    return Number(percentage.toFixed(1));
};

export const getName = (resourceType: ResourceType) => {
    switch (resourceType) {
        case ResourceType.RAM:
            return "RAM";
        case ResourceType.CPU:
            return "CPU";
        case ResourceType.NET:
            return "NET";
    }
}

export const getUnit = (resourceType: ResourceType) => {
    switch (resourceType) {
        case ResourceType.RAM:
        case ResourceType.NET:
            return "kb";
        case ResourceType.CPU:
            return "ms";
    }
}