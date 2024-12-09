import axios from "axios";
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useVueFlow } from "@vue-flow/core";
import { useVFlowInitial } from "@/hooks/useVFlowInitial";
import { getUuid, setValueByPath } from "@/utils/tools";
import { useRequestMethod } from "@/services/useRequestMethod";
import { useVFlowManagement } from "@/hooks/useVFlowManagement";
import { SubscribeSSE } from '@/services/useSSE'
import { useMessage } from 'naive-ui';

let instance = null;
export const useFlowAOperation = () => {
  if (instance) return instance;
  const { findNode, getNodes, toObject, fromObject, removeNodes } = useVueFlow();
  const { postData, getData } = useRequestMethod();
  const {
    reBuildCounter,
  } = useVFlowInitial();
  const {
    resetNodeState,
    buildNestedNodeGraph,
  } = useVFlowManagement();
  const message = useMessage();
  const TaskID = ref(null);
  const TaskName = ref(null);

  const runflow = async (
    data,
    callback = null,
  ) => {
    return await postData(`api/run`, data, callback);
  };

  const updateNodeFromSSE = (data) => {
    const nid = data.nid;
    const oriid = data.oriid;
    const updatedatas = data.data;
    for (const udata of updatedatas) {
      const data = udata.data;
      const path = udata.path;
      const type = udata.type;
      if (type === "overwrite") {
        // 特殊处理状态改变
        if (nid.includes('#')
          && path[0] === 'state'
          && path[1] == 'status') {
          const vf_node = findNode(oriid);
          if (vf_node && !vf_node.data.flags.isAttached) {
            vf_node.data.state.copy[nid] = { status: data };
          }
        }
        else {
          const thenode = findNode(nid);
          if (thenode) {
            setValueByPath(thenode.data, path, data);
          }
        }
      }
      else if (type === "append") { }
      else if (type === "remove") { }
    }
  }
  const { subscribe, unsubscribe } = SubscribeSSE(
    'GET',
    null,
    null,
    // onOpen
    async (response) => {
      // console.log("onopen SSE", response.ok);
    },
    // onMessage
    async (event) => {
      // console.log("onmessage SSE");
      if (event.event === "updatenode") {
        let data = JSON.parse(event.data);
        // console.log(data);
        updateNodeFromSSE(data);
      }
      else if (event.event === "batchupdatenode") {
        let datas = JSON.parse(event.data);
        for (const data of datas) {
          updateNodeFromSSE(data);
        }
      }
      else if (event.event === "internalerror") {
        let data = JSON.parse(event.data);
        // console.log(data);
        message.error(`内部错误: ${data}`);
      }
      else if (event.event === "flowfinish") {
        unsubscribe();
        message.success('工作流运行完成');
      }
    },
    // onClose
    async () => {
      console.log("onclose SSE");
    },
    // onError
    async (err) => {
      console.log("onerror SSE", err);
    },
  );

  const loadVflow = async (flow) => {
    if (flow) {
      removeNodes(getNodes.value);
      await nextTick();
      for (const node of flow.nodes) {
        resetNodeState(node);
      }
      fromObject(flow);
      buildNestedNodeGraph();
      reBuildCounter();
    }
  }

  const saveWorkflow = async (name, callback) => {
    const data = {
      name: name,
      vflow: toObject(),
    }
    await postData("manager/saveworkflow", data, callback);
  };

  const getWorkflows = async () => {
    return await getData("manager/workflows");
  };

  const loadWorkflow = async (name) => {
    if (!name) return;
    const flow = await postData(`manager/getworkflow?name=${name}`);
    console.log(`load Workflow ${name}: `, flow);
    loadVflow(flow.vflow);
    TaskID.value = null;
    TaskName.value = flow.name;
  };

  const getHistorys = async () => {
    return await getData("manager/historys");
  };

  const loadHistory = async (tid) => {
    if (!tid) return;
    const flow = await postData(`manager/loadhistory?tid=${tid}`);
    console.log(`load History ${tid}: `, flow);
    if (flow) {
      loadVflow(flow.vflow);
      TaskID.value = tid;
      TaskName.value = flow.name;
    }
  };

  onMounted(async () => {
    // 打开网页就加载可能的历史taskid
    const ls_tid = localStorage.getItem('curTaskID') || null;
    await loadHistory(ls_tid);
    // 监听TaskID变化，第一次即订阅以获取历史记录的工作流数据
    watch(TaskID, (newVal) => {
      if (newVal) {
        setTimeout(() => {
          console.log("curTaskID ", newVal);
          localStorage.setItem('curTaskID', newVal);
          subscribe(`${import.meta.env.VITE_API_URL}/api/progress?taskid=${newVal}`)
          console.log("subscribeSSE Done.");
        }, 1000);
      }
    }, { immediate: true });
  });

  onUnmounted(() => {
    unsubscribe();
  });

  instance = {
    TaskID,
    TaskName,
    runflow,
    saveWorkflow,
    getWorkflows,
    loadWorkflow,
    getHistorys,
    loadHistory,
  };
  return instance;
};
