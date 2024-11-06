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
    addAttachedNode,
    setSize,
    getSize,
    setAttachedAttribute,
    addHandle,
    addConnection,
    rmConnection,
    addPayload,
    addResult,
    rmPayload,
    rmResult,
} from '../NodeOperator.js'

import { add, cloneDeep } from 'lodash';
import NodeVue from '../all_node_vue/basenode.vue';

const _initInfo = createBaseNodeInfo();
initNestedAttribute(_initInfo);
initConnectionsAttribute(_initInfo);
initRunningAttribute(_initInfo);
initStateAttribute(_initInfo);
setNodeType(_initInfo, "iter_run");
setVueType(_initInfo, "basenode");
setLabel(_initInfo, "迭代运行");
initSize(_initInfo, 200, 200);

// 嵌套节点只能添加一个handle
addHandle(_initInfo, "self", "self");
addHandle(_initInfo, "inputs", "input");
addHandle(_initInfo, "outputs", "output");
addHandle(_initInfo, "callbackUsers", "callbackUser");
addHandle(_initInfo, "callbackFuncs", "callbackFunc");

addAttachedNode(_initInfo, "attached_node_input", "input", "top-left");
addAttachedNode(_initInfo, "attached_node_callbackUser", "callbackUser", "top-right");
addAttachedNode(_initInfo, "attached_node_output", "output", "bottom-right");
addAttachedNode(_initInfo, "attached_node_callbackFunc", "callbackFunc", "bottom-left");

addConnection(_initInfo, "self", "self", { type: "FromAttached", atype: "output", useid: [] });
addConnection(_initInfo, "inputs", "input", { type: "FromOuter", inputKey: "input" });

let pid = addPayload(_initInfo, { label: "迭代索引", type: "IterIndex", key: "iter_index", data: null, uitype: "texttag" });
addConnection(_initInfo, "attach", "attach", { type: "FromInner", path: ["payloads", pid], useid: [] });

// 【结果】是用来动态调整【输出链接】的
addResult(_initInfo, { label: "输出", type: "Array", key: "iter_output", data: [], uitype: "packoutput" }, "output");

export const initInfo = cloneDeep(_initInfo);
// 该节点需要实现，动态的handle和文字
export { NodeVue };