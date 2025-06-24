import { memo } from "react";
import { NodeResizer } from "@xyflow/react";

const ResizableNode = ({ data, selected }) => {
  const isLocked = data?.locked;
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer
        isVisible={selected && !isLocked}
        minWidth={50}
        minHeight={50}
        color="#007bff"
      />
      <img
        src={data?.image || "/default.jpg"}
        alt="Resizable"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default memo(ResizableNode);
