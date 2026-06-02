mergeInto(LibraryManager.library, {
  OpenLearningTask: function (taskIdPtr) {
    var taskId = UTF8ToString(taskIdPtr);

    if (
      window.parent &&
      typeof window.parent.openLearningTask === "function"
    ) {
      window.parent.openLearningTask(taskId);
    } else if (typeof window.openLearningTask === "function") {
      window.openLearningTask(taskId);
    } else {
      console.error("window.openLearningTask is not available. Task ID:", taskId);
    }
  }
});
