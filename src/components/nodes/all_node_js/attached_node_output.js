import {
    createBaseNodeInfo,
    initAttachedAttribute,
    initNestedAttribute,
    initConnectionsAttribute,
    initRunningAttribute,
    initStateAttribute,
    initMinSize,
    initSize,
    setNodeType,
    setVueType,
    setLabel,
    setAttaching,
    addAttachedNode,
    addHandle,
    addConnection,
    rmConnection,
    addPayload,
    addResultWConnect,
    rmPayload,
    rmResultWConnect,
    setOutputsUIType,
} from '../NodeOperator.js'

import { cloneDeep } from 'lodash';
import NodeVue from '../all_node_vue/attached_node.vue';

const _initInfo = createBaseNodeInfo();
initAttachedAttribute(_initInfo);
setNodeType(_initInfo, "attached_node_output");
setVueType(_initInfo, "attached_node");
setLabel(_initInfo, "附属节点");
setAttaching(_initInfo, "output", "bottom-right", "OUTPUT");
initSize(_initInfo, 20, 6);

initConnectionsAttribute(_initInfo);
// 加个输入handle，自动开搜
addHandle(_initInfo, "inputs", "input");
addConnection(_initInfo, "self", "self", { type: "FromOuter", inputKey: "input" });

export const initInfo = cloneDeep(_initInfo);
export { NodeVue };
