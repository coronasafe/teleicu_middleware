const requestLogTBody = document.getElementById("request-log-tbody");
const errorLogTBody = document.getElementById("error-log-tbody");

const serverStatusDot = document.getElementById("server-status-dot");
const serverStatusText = document.getElementById("server-status-text");

const cpuUsage = document.getElementById("cpu-usage");
const memoryUsage = document.getElementById("memory-usage");
const serverLoad = document.getElementById("server-load");
const serverUptime = document.getElementById("uptime");

const eventType = {
  Error: "ERROR",
  Request: "REQUEST",
  Resource: "RESOURCE",
};

function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + " Sec";
  else if (minutes < 60) return minutes + " Min";
  else if (hours < 24) return hours + " Hrs";
  else return days + " Days";
}

const getRequestLogTemplate = ({ time, method, url, status, responseTime }) => {
  const tr = document.createElement("tr");
  const tdTime = document.createElement("td");
  const tdMethod = document.createElement("td");
  const tdUrl = document.createElement("td");
  const tdStatus = document.createElement("td");
  const tdResponseTime = document.createElement("td");

  tdTime.innerText = time;
  tdMethod.innerText = method;
  tdUrl.innerText = url;
  tdStatus.innerText = status;
  tdResponseTime.innerText = responseTime;

  tr.classList.add("border-b", "hover:bg-primary-100");
  [tdTime, tdMethod, tdStatus, tdUrl, tdResponseTime].forEach((td) => {
    td.classList.add(
      "px-3",
      "py-2",
      "whitespace-normal",
      "break-all",
      "text-sm",
      "font-medium",
      "text-gray-900",
    );
    tr.appendChild(td);
  });

  return tr;
};

const getErrorLogTemplate = ({ time, status, method, message, url }) => {
  const tr = document.createElement("tr");
  const tdTime = document.createElement("td");
  const tdStatus = document.createElement("td");
  const tdMessage = document.createElement("td");
  const tdMethod = document.createElement("td");
  const tdUrl = document.createElement("td");

  tdTime.innerText = time;
  tdStatus.innerText = status;
  tdMessage.innerText = message;
  tdMethod.innerText = method;
  tdUrl.innerText = url;

  tr.classList.add("border-b", "hover:bg-primary-100");
  [tdTime, tdMethod, tdStatus, tdUrl, tdMessage].forEach((td) => {
    td.classList.add(
      "px-3",
      "py-2",
      "whitespace-normal",
      "break-all",
      "text-sm",
      "font-medium",
      "text-gray-900",
    );
    tr.appendChild(td);
  });

  return tr;
};

function connect() {
  const url = window.location.origin.replace(/^http/, "ws") + "/logger";
  var ws = new WebSocket(url);
  ws.onopen = function () {
    console.log("Connected to server");
    serverStatusDot.classList.add("bg-green-500");
    serverStatusText.innerText = "Connected";
  };
  const isFirstLog = {
    error: false,
    request: false,
  };
  ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data?.type === eventType.Request) {
      console.log(data);
      if (!isFirstLog.request) {
        isFirstLog.request = true;
        requestLogTBody.innerHTML = "";
      }
      requestLogTBody.prepend(getRequestLogTemplate(data));
    }
    if (data?.type === eventType.Error) {
      console.log(data);
      if (!isFirstLog.error) {
        isFirstLog.error = true;
        errorLogTBody.innerHTML = "";
      }
      errorLogTBody.prepend(getErrorLogTemplate(data));
    }
    if (data?.type === eventType.Resource) {
      const { cpu, memory, uptime, load } = data;

      cpuUsage.innerText = `${cpu}%`;
      memoryUsage.innerText = `${memory}MB`;
      serverLoad.innerText = `${load}%`;
      serverUptime.innerText = msToTime(uptime);
    }
  };

  ws.onclose = function (e) {
    console.log(
      "Connection is closed. Reconnect will be attempted in 1 second.",
      e.reason,
    );

    serverStatusDot.classList.remove("bg-green-500");
    serverStatusDot.classList.add("bg-red-500");
    serverStatusText.innerText = "Disconnected";

    cpuUsage.innerText = `---`;
    memoryUsage.innerText = `---`;
    serverLoad.innerText = `---`;
    serverUptime.innerText = "---";

    setTimeout(function () {
      connect();
    }, 1000);
  };

  ws.onerror = function (err) {
    console.error("Socket encountered error: ", err.message, "Closing socket");
    ws.close();
  };
}

connect();
