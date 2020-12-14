import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var mixlinebar91275C762EF847969B236C51745DEF81: IVisualPlugin = {
    name: 'mixlinebar91275C762EF847969B236C51745DEF81',
    displayName: '双Y轴柱状图',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["mixlinebar91275C762EF847969B236C51745DEF81"] = mixlinebar91275C762EF847969B236C51745DEF81;
}

export default mixlinebar91275C762EF847969B236C51745DEF81;