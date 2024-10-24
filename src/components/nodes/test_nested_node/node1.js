import NodeVue from './node.vue';
export const initInfo = {
    node_key: "test_nested_node",
    node_type: "test_nested_node",
    init_width: 200,
    init_height: 150,
    init_data: {
        // 必要参数 ========
        _is_nested: true,
        _is_attached: false,
        size: {
            width: -1,
            height: -1,
        },// 会在创建时自动应用init_width和init_height
        label: "测试嵌套节点",
        // =================
        // 可选参数
        min_size: {
            width: 200,
            height: 150,
        },// 最小尺寸
        nested_pad: {
            top: 70,
            bottom: 40,
            left: 60,
            right: 60,
        },// 嵌套节点边距
        attached_pad: {
            top: 45,
            bottom: 30,
            left: 20,
            right: 20,
        },// 嵌套固定节点边距
        attached_nodes: [
            { type: "test_attached_node", attached_type: "input", pos: "top-left" },// top|center|bottom-left|center|right
            { type: "test_attached_node", attached_type: "callbackFunc", pos: "top-right" },
            { type: "test_attached_node", attached_type: "output", pos: "bottom-right" },
        ],// 固定嵌套节点，会自动给子节点data添加"_is_attached=true"，同时设置为不可拖动

        // =================
    },
};

export { NodeVue };