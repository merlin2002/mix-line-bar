/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.IVisualHost;
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";
import * as echarts from 'echarts';

import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewValueColumns = powerbi.DataViewValueColumns
import DataViewValueColumn = powerbi.DataViewValueColumn
import { thresholdFreedmanDiaconis } from "d3";

export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;


    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options.dataViews[0];
        const categoricalDataView: DataViewCategorical = dataView.categorical;
        debugger;
        if (!categoricalDataView ||
            !categoricalDataView.categories ||
            !categoricalDataView.categories[0] ||
            !categoricalDataView.values) {
            return;
        }

        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.target.innerHTML = `<div id='echarts' class='echarts' name='echarts' style='width: 100%;height: 100%;text-align: center;'></div>`;



        let width: number = options.viewport.width;
        let height: number = options.viewport.height;

        const categoryFieldIndex = 0;
        const measureFieldIndex = 0;
        let categories: PrimitiveValue[] = categoricalDataView.categories[categoryFieldIndex].values;
        let values: DataViewValueColumns = categoricalDataView.values;

        let data_col = [];
        let data_line = [];
        let legend_col = [];
        let legend_line = [];

        values.map((years: DataViewValueColumn, index) => {
            let _val = [];
            if (years.source.format == "0.00%;-0.00%;0.00%") {
                years.values.forEach(element => {
                    _val.push(Number(element) * 100).toFixed(2);
                });
            }
            else {
                _val = years.values;
            }
            if (years.source.roles.measure_bar) {
                data_col.push(_val)
                if (!legend_col.includes(years.source.displayName.toString())) {
                    legend_col.push(years.source.displayName)
                }
            }

            if (years.source.roles.measure_line) {
                data_line.push(_val)
                if (!legend_line.includes(years.source.displayName.toString())) {
                    legend_line.push(years.source.displayName)
                }
            }

        });

        // this.target.innerText = JSON.stringify(data, null, 6);
        console.log(data_col);
        console.log(data_line);
        //绘制图表
        const ec = echarts as any;
        // try{

        //         $.getJSON('./../assets/vintage.project.json', function (themeJSON) {
        //             echarts.registerTheme('vintage', JSON.parse(themeJSON))
        //             console.log(themeJSON);
        //             this.target.innerHTML = themeJSON;
        //             // var chart = echarts.init(dom, 'vintage');
        //         });
        //     }
        //     catch(ex)
        //     { 
        //         this.target.innerHTML = ex;
        //     }

        let colorname = this.settings.myproperties.theme;
        if (colorname != "default") {
            echarts.registerTheme(colorname, JSON.parse(this.settings.myproperties.getthemecolor(colorname)))
        }

        var myChart = ec.init(document.getElementById('echarts'), colorname == "default" ? null : colorname, { renderer: this.settings.myproperties.renderer });
        // const singleDataView: DataViewSingle = dataView.single;
        // const dataViewcategorical:DataViewCategorical=dataView.categorical;
        let showlegend:boolean=this.settings.myproperties.showlegend;
        let showlable:boolean=this.settings.myproperties.showlable;
        let lableposition:string=this.settings.myproperties.lableposition;

        try {
            myChart.setOption(
                {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            crossStyle: {
                                color: '#999'
                            },
                        }
                    },
                    toolbox: {
                        show: this.settings.myproperties.showtoolbox,
                        feature: {
                            dataView: { show: true, readOnly: false },
                            magicType: { show: true, type: ['line', 'bar'] },
                            restore: { show: true },
                            saveAsImage: { show: true }
                        }
                    },
                    legend: {
                        show: showlegend,
                        data: legend_col.concat(legend_line)
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: categories,
                            axisPointer: {
                                type: 'shadow'
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            // name: '水量',
                            // min: 0,
                            // max: 250,
                            // interval: 50,
                            // axisLabel: {
                            //     formatter: '{value} ml'
                            // }
                        },
                        {
                            type: 'value',
                            // name: '温度',
                            // min: 0,
                            // max: 1,
                            // interval: 5,
                            axisLabel: {
                                formatter: '{value}%'
                            }
                        }
                    ],
                    series: function () {
                        let series = [];
                        data_col.forEach((element, index) => {
                            series.push(
                                {
                                    data: element,
                                    type: "bar",
                                    label: {
                                        show: showlable,
                                        position: lableposition
                                    },
                                    name: legend_col[index],
                                    emphasis: {
                                        focus: 'series'
                                    }
                                }
                            )
                        });

                        data_line.forEach((element, index) => {
                            series.push(
                                {
                                    data: element,
                                    type: "line",
                                    label: {
                                        show: showlable,
                                        position: lableposition
                                    },
                                    yAxisIndex: 1,
                                    name: legend_line[index],
                                }
                            )
                        });

                        return series;
                    }()
                })
        }
        catch (ex) {
            this.target.innerHTML = ex;
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}