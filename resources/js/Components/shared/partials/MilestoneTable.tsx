import React, { useState } from 'react';

const MilestoneTable = ({
    milestones ,
    status ,
}: {
    milestones: any[] ,
    status: boolean

 }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const openModal = (description: string) => {
    setModalContent(description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
  };

  return (
      <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-200">
                  <tr>
                      <th className="px-4 py-2 border-b">Amount</th>
                      <th className="px-4 py-2 border-b text-start">
                          Vehicle Description
                      </th>
                      <th className="px-4 py-2 border-b">Due Date</th>
                      {status && <th className="px-4 py-2 border-b">Status</th>}
                  </tr>
              </thead>
              <tbody>
                  {milestones.map((milestone) => (
                      <tr key={milestone.id}>
                          <td className="px-4 py-2 text-center border-b">
                              ${milestone.amount}
                          </td>
                          <td className="px-4 py-2 border-b cursor-pointer">
                              <div className="max-w-xs overflow-hidden whitespace-nowrap overflow-ellipsis">
                                  {milestone.description.length > 30 ? (
                                      <>
                                          {milestone.description.substring(
                                              0,
                                              30,
                                          )}
                                          ...
                                          <span
                                              className="text-blue-500 cursor-pointer"
                                              onClick={() =>
                                                  openModal(
                                                      milestone.description,
                                                  )
                                              }
                                          >
                                              More
                                          </span>
                                      </>
                                  ) : (
                                      milestone.description
                                  )}
                              </div>
                          </td>
                          <td className="w-24 px-4 py-2 text-center border-b whitespace-nowrap">
                              {milestone.due_date_human}
                          </td>
                          {status && (
                              <td
                                  className={
                                      "px-4 py-2 text-center border-b first-letter:capitalize " +
                                      (milestone.status === "completed"
                                          ? "text-green-500"
                                          : milestone.status === "active"
                                            ? "text-blue-500"
                                            : "text-yellow-500")
                                  }
                              >
                                  {milestone.status === "active"
                                      ? "To Pay"
                                      : milestone.status}
                              </td>
                          )}
                      </tr>
                  ))}
              </tbody>
          </table>
          {/* Modal */}
          {isModalOpen && (
              <div
                  onClick={closeModal}
                  className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900 bg-opacity-50"
              >
                  <div
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-lg p-6 space-y-4 bg-white rounded-lg shadow-lg"
                  >
                      <div className="flex justify-between">
                          <h2 className="flex justify-center text-xl font-bold">
                              Milestone Description
                          </h2>
                          <button
                              type="button"
                              onClick={closeModal}
                              className="text-lg text-gray-500 hover:text-black"
                          >
                              <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-6 h-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                              >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                  />
                              </svg>
                          </button>
                      </div>
                      <p>{modalContent}</p>
                  </div>
              </div>
          )}
      </div>
  );
};

export default MilestoneTable;
