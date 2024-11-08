import React, { useEffect, useState } from "react";
import "./SmallStatistic.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  PROGRESSTASKSTATUSENUM,
  TASKPRIORITY,
} from "../../../../constants/enum";
import { Pie } from "@ant-design/charts";
import { Table } from "antd";

function SmallStatistic(props) {
  const { progress } = props;

  const { date, tasks, percent } = progress;

  const columns = [
    {
      title: "Công việc",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      render: (text) => {
        // Tìm màu sắc dựa trên độ ưu tiên
        const priorityInfo = TASKPRIORITY.find((item) => item.value === text);
        return (
          <div
            style={{
              backgroundColor: priorityInfo?.color,
              textAlign: "center",
              padding: "10px",
              fontWeight: "bold",
            }}
          >
            {priorityInfo ? priorityInfo.label : text}
          </div>
        );
      },
    },
  ];

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const newChartData = [];

    for (let key in percent) {
      if (percent.hasOwnProperty(key)) {
        newChartData.push({
          type: PROGRESSTASKSTATUSENUM[key],
          value: percent[key],
        });
      }
    }

    setChartData(newChartData);
  }, []);

  const paginationConfig = {
    pageSize: 3,
  };

  useEffect(() => {
    const newChartData = [];

    for (let key in percent) {
      if (percent.hasOwnProperty(key)) {
        newChartData.push({
          type: PROGRESSTASKSTATUSENUM[key],
          value: percent[key],
        });
      }
    }

    setChartData(newChartData);
  }, [percent]);

  return (
    <div className="small-statistic-container d-flex justify-content-between row">
      <div className="small-statistic-chart-container col-6">
        <p className="small-statistic-chart-title">{date}</p>
        {chartData.length > 0 && (
          <Pie
            appendPadding={10}
            data={chartData}
            angleField={"value"}
            colorField={"type"}
            radius={1}
            label={{
              offset: "-30%",
              style: { fontSize: 14, textAlign: "center" },
            }}
            style={{ height: "50px" }}
          />
        )}
      </div>
      <div className="small-statistic-tasks-container col-6">
        <h4 className="small-statistic-tasks-title">
          Danh sách công việc chưa hoàn thành
        </h4>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={paginationConfig}
        />
      </div>
    </div>
  );
}

export default SmallStatistic;
