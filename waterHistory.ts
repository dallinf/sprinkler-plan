export interface IWaterDay {
    date: string;
    durationMinutes: number;
}

export class WaterDay implements IWaterDay {
    constructor(
        public readonly date: string,
        public readonly durationMinutes: number
    ) {}

    static fromObject(obj: any): WaterDay {
        return new WaterDay(obj.date, obj.userDuration / 60);
    }
}

export class WaterHistory {
    constructor(public readonly days: WaterDay[]) {}

    static fromArray(waterLog: { days: any[] }): WaterHistory {
        return new WaterHistory(waterLog.days.map(WaterDay.fromObject));
    }
}
