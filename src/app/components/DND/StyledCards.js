import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const StyledCards = {
  uno: {
    joker: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          backgroundImage:
            "linear-gradient(to top left, red, red), " +
            "linear-gradient(to top right, blue, blue), " +
            "linear-gradient(to bottom left, green, green), " +
            "linear-gradient(to bottom right, yellow, yellow)",
          backgroundSize: "50% 50%",
          backgroundPosition: "top left, top right, bottom left, bottom right",
          backgroundRepeat: "no-repeat",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
          border: `2px solid ${data.color}`,
        }}
      />
    ),
    number: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: data?.color,
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
        }}
      >
        <div className={`text-${data?.color === "yellow" ? "black" : "white"}`}>
          {data?.text}
        </div>
      </div>
    ),
    skip: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: data?.color,
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "5px",
          margin: "10px",
        }}
      >
        <div
          className={`text-${
            data?.color === "yellow" ? "black" : "white"
          } flex flex-col justify-center items-center`}
        >
          <XMarkIcon className="h-3/5 w-3/4" />
          <div className="text-xs mb-2">SKIP !</div>
        </div>
      </div>
    ),
    "+2": ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: data?.color,
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
        }}
      >
        <div>+2</div>
      </div>
    ),
    "+4": ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: "#000",
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
          border: `2px solid ${data.color}`,
        }}
      >
        <div>+4</div>
      </div>
    ),
    reverse: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: data?.color,
          color: data?.color === "yellow" ? "black" : "white",
          width: "50px",
          height: "50px",
          padding: "5px",
          margin: "10px",
        }}
      >
        <div className="w-full h-full flex flex-col justify-center align-center">
          <ArrowUturnRightIcon className="h-full w-full" />
          <ArrowUturnLeftIcon className="h-full w-full" />
        </div>
      </div>
    ),
  },
  sort: {
    date: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          width: "50px",
          height: "50px",
          padding: "5px",
          margin: "10px",
          backgroundImage: `url('/timeline.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full h-full flex flex-col justify-center align-center">
          {data.date}
        </div>
      </div>
    ),
  },
};
