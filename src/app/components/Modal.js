"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";

// export default function Modal({ children, isOpen, onClose }) {
//   const [modalOpen, setModalOpen] = useState(isOpen);

//   useEffect(() => {
//     setModalOpen(isOpen);
//   }, [isOpen]);

//   const handleClose = () => {
//     setModalOpen(false);
//     onClose();
//   };

//   return (
//     // <div className="overflow-hidden">
//     <div
//       className="overflow-hidden fixed"
//       style={{
//         zIndex: isOpen ? 100 : 0,
//         height: isOpen ? "100vh" : 0,
//         width: isOpen ? "100vw" : 0,
//         top: 0,
//         left: 0,
//       }}
//     >
//       {modalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none">
//           <div
//             onClick={() => handleClose()}
//             // className="fixed inset-0 z-0 bg-black opacity-25"
//             className="fixed inset-0 bg-black opacity-25"
//           />
//           <div className="z-1 relative w-auto max-w-lg mx-auto my-6">
//             <div className="relative flex w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
//               <div className="relative p-4 flex-auto bg-gray-100 rounded-lg">
//                 {children}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

export default function Modal({ children, isOpen, onClose }) {
  const [modalOpen, setModalOpen] = useState(isOpen);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  if (typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    modalOpen && (
      <div
        className="overflow-hidden fixed"
        style={{
          zIndex: isOpen ? 90 : 0,
          height: isOpen ? "100vh" : 0,
          width: isOpen ? "100vw" : 0,
          top: 0,
          left: 0,
        }}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none">
          <div
            onClick={() => handleClose()}
            className="fixed inset-0 bg-black opacity-25"
          />
          <div className="z-1 relative w-auto max-w-lg mx-auto my-6">
            <div className="relative flex w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
              <div className="relative p-4 flex-auto bg-gray-100 rounded-lg">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    document.body
  );
}

export function InputModal({ isOpen, onClose, action, name, message }) {
  const windowHeight = useMemo(() => window.innerHeight, []);
  const [windowResizedHeight, setWindowResizedHeight] = useState(
    window.visualViewport.height
  );

  const [modalOpen, setModalOpen] = useState(isOpen);
  const inputRef = useRef(null);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.click();
      }, 50);
    }
  }, [modalOpen]);

  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  useEffect(() => {
    const updateHeight = () => {
      setWindowResizedHeight(
        window.visualViewport.height || window.innerHeight
      );
    };

    window.visualViewport.addEventListener("resize", updateHeight);
    window.visualViewport.addEventListener("focusin", updateHeight);
    window.visualViewport.addEventListener("focusout", updateHeight);

    return () => {
      window.visualViewport.removeEventListener("resize", updateHeight);
      window.visualViewport.removeEventListener("focusin", updateHeight);
      window.visualViewport.removeEventListener("focusout", updateHeight);
    };
  }, []);

  return ReactDOM.createPortal(
    // modalOpen && (
    <div
      // className="overflow-hidden fixed"
      className={`overflow-hidden fixed ${!modalOpen && "hidden"}`}
      style={{
        zIndex: isOpen ? 100 : 0,
        // height: isOpen ? "100vh" : 0,
        width: isOpen ? "100vw" : 0,
        left: 0,
      }}
    >
      <div className="fixed inset-0 flex items-end justify-center outline-none focus:outline-none">
        <div onClick={() => handleClose()} className="fixed inset-0" />

        <div
          className="w-full absolute"
          style={{
            bottom: `calc(${windowHeight}px - ${windowResizedHeight}px)`,
          }}
        >
          <div className="relative flex w-full border border-y-2 border-x-0 border-black outline-none focus:outline-none">
            <div className="relative pb-4 flex-auto bg-sky-100 flex flex-col items-center">
              <div className="h-6 my-2 text-sky-700 font-semibold">
                {message}
              </div>

              <form action={action}>
                <input
                  ref={inputRef}
                  name={name}
                  className="text-center h-6 focus:outline-none border focus:border-amber-700 rounded-md focus:bg-amber-100"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    // )
    document.body
  );
}

export function DiscoModal({ children, isOpen }) {
  const [modalOpen, setModalOpen] = useState(isOpen);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  return (
    <div className="overflow-hidden">
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none">
          <div className="fixed inset-0 z-0 backdrop-blur-sm backdrop-brightness-75" />

          <div className="z-1 relative w-auto max-w-lg mx-auto my-6">
            <div className="relative flex w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
              <div className="relative p-4 flex-auto">{children}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
