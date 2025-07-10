class TodoApp {
  constructor() {
    this.tasks = this.loadTasks()
    this.taskInput = document.getElementById("taskInput")
    this.addTaskBtn = document.getElementById("addTaskBtn")
    this.tasksList = document.getElementById("tasksList")
    this.emptyState = document.getElementById("emptyState")
    this.statsSection = document.getElementById("statsSection")
    this.currentTab = "all"
    this.searchTerm = ""
    this.categoryFilter = "all"

    this.init()
    this.initializeElements()
    this.bindEvents()
  }

  init() {
    this.addTaskBtn.addEventListener("click", () => this.addTask())
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask()
      }
    })

    this.renderTasks()
    this.updateStats()
  }

  initializeElements() {
    // Form elements
    this.addTaskForm = document.getElementById("addTaskForm")
    this.editTaskForm = document.getElementById("editTaskForm")
    this.searchInput = document.getElementById("searchInput")
    this.categoryFilterElement = document.getElementById("categoryFilter")

    // Display elements
    this.tasksList = document.getElementById("tasksList")
    this.emptyState = document.getElementById("emptyState")

    // Tab elements
    this.tabButtons = document.querySelectorAll("[data-tab]")

    // Modal elements
    this.addTaskModal = document.getElementById("addTaskModal")
    this.editTaskModal = document.getElementById("editTaskModal")

    // Create toast container
    this.createToastContainer()
  }

  bindEvents() {
    // Form submissions
    this.addTaskForm.addEventListener("submit", (e) => this.handleAddTask(e))
    this.editTaskForm.addEventListener("submit", (e) => this.handleEditTask(e))

    // Search and filter
    this.searchInput.addEventListener("input", (e) => this.handleSearch(e))
    this.categoryFilterElement.addEventListener("change", (e) => this.handleCategoryFilter(e))

    // Tab switching
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.handleTabSwitch(e))
    })

    // Modal events
    document.getElementById("addTaskModal").addEventListener("hidden.bs.modal", () => {
      this.resetAddForm()
    })
  }

  addTask() {
    const taskText = this.taskInput.value.trim()

    if (taskText === "") {
      this.showAlert("Please enter a task!", "warning")
      return
    }

    const task = {
      id: Date.now(),
      text: taskText,
      category: "", // Default category
      priority: "normal", // Default priority
      dueDate: null, // Default due date
      important: false, // Default important status
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.tasks.unshift(task)
    this.saveTasks()
    this.taskInput.value = ""
    this.renderTasks()
    this.updateStats()
    this.showAlert("Task added successfully!", "success")
  }

  deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((task) => task.id !== id)
      this.saveTasks()
      this.renderTasks()
      this.updateStats()
      this.showAlert("Task deleted!", "info")
    }
  }

  toggleTask(id) {
    const task = this.tasks.find((task) => task.id === id)
    if (task) {
      task.completed = !task.completed
      this.saveTasks()
      this.renderTasks()
      this.updateStats()

      const message = task.completed ? "Task completed!" : "Task marked as pending!"
      this.showAlert(message, "success")
    }
  }

  toggleImportant(id) {
    const task = this.tasks.find((task) => task.id === id)
    if (task) {
      task.important = !task.important
      this.saveTasks()
      this.renderTasks()

      const message = task.important ? "Task marked as important!" : "Task unmarked as important!"
      this.showToast(message, "info")
    }
  }

  handleAddTask(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const taskData = {
      text: document.getElementById("taskText").value,
      category: document.getElementById("taskCategory").value,
      priority: document.getElementById("taskPriority").value,
      dueDate: document.getElementById("taskDueDate").value,
      important: document.getElementById("taskImportant").checked,
    }

    if (taskData.text.trim()) {
      this.addTask(taskData)
      this.addTaskModal.hide()
    }
  }

  handleEditTask(e) {
    e.preventDefault()

    const id = Number.parseInt(document.getElementById("editTaskId").value)
    const updates = {
      text: document.getElementById("editTaskText").value,
      category: document.getElementById("editTaskCategory").value,
      priority: document.getElementById("editTaskPriority").value,
      dueDate: document.getElementById("editTaskDueDate").value || null,
      important: document.getElementById("editTaskImportant").checked,
    }

    if (updates.text.trim()) {
      this.editTask(id, updates)
      this.editTaskModal.hide()
    }
  }

  handleSearch(e) {
    this.searchTerm = e.target.value.toLowerCase()
    this.renderTasks()
  }

  handleCategoryFilter(e) {
    this.categoryFilter = e.target.value
    this.renderTasks()
  }

  handleTabSwitch(e) {
    e.preventDefault()

    // Update active tab
    this.tabButtons.forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    this.currentTab = e.target.dataset.tab
    this.renderTasks()
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks()

    if (filteredTasks.length === 0) {
      this.tasksList.style.display = "none"
      this.emptyState.style.display = "block"
    } else {
      this.tasksList.style.display = "block"
      this.emptyState.style.display = "none"

      this.tasksList.innerHTML = filteredTasks.map((task) => this.createTaskHTML(task)).join("")
    }
  }

  createTaskHTML(task) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

    return `
      <div class="task-item ${task.completed ? "completed" : ""} ${isOverdue ? "overdue" : ""}" data-id="${task.id}">
        <div class="d-flex justify-content-between align-items-center">
          <div class="flex-grow-1">
            <p class="task-text">${this.escapeHtml(task.text)}</p>
            <small class="text-muted">
              <i class="fas fa-clock me-1"></i>
              ${this.getRelativeTime(task.createdAt)}
            </small>
          </div>
          <div class="task-actions">
            <button class="task-btn ${task.completed ? "uncomplete-btn" : "complete-btn"}" 
                    onclick="window.todoApp.toggleTask(${task.id})"
                    title="${task.completed ? "Mark as pending" : "Mark as completed"}">
              <i class="fas ${task.completed ? "fa-undo" : "fa-check"}"></i>
            </button>
            <button class="task-action-btn important ${task.important ? "active" : ""}" 
                    onclick="window.todoApp.toggleImportant(${task.id})" title="Toggle Important">
              <i class="fas fa-star"></i>
            </button>
            <button class="task-action-btn edit" onclick="window.todoApp.openEditModal(${task.id})" title="Edit Task">
              <i class="fas fa-edit"></i>
            </button>
            <button class="task-btn delete-btn" 
                    onclick="window.todoApp.deleteTask(${task.id})"
                    title="Delete task">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
  }

  openEditModal(id) {
    const task = this.tasks.find((task) => task.id === id)
    if (task) {
      document.getElementById("editTaskId").value = task.id
      document.getElementById("editTaskText").value = task.text
      document.getElementById("editTaskCategory").value = task.category || ""
      document.getElementById("editTaskPriority").value = task.priority
      document.getElementById("editTaskDueDate").value = task.dueDate || ""
      document.getElementById("editTaskImportant").checked = task.important

      this.editTaskModal.style.display = "block"
    }
  }

  getFilteredTasks() {
    return this.tasks.filter((task) => {
      // Text search
      const matchesSearch = task.text.toLowerCase().includes(this.searchTerm)

      // Category filter
      const matchesCategory =
        this.categoryFilter === "all" || task.category.toLowerCase() === this.categoryFilter.toLowerCase()

      // Tab filter
      let matchesTab = true
      switch (this.currentTab) {
        case "active":
          matchesTab = !task.completed
          break
        case "completed":
          matchesTab = task.completed
          break
        case "important":
          matchesTab = task.important
          break
      }

      return matchesSearch && matchesCategory && matchesTab
    })
  }

  updateStats() {
    const total = this.tasks.length
    const completed = this.tasks.filter((task) => task.completed).length
    const pending = total - completed
    const important = this.tasks.filter((task) => task.important && !task.completed).length

    document.getElementById("totalTasks").textContent = total
    document.getElementById("completedTasks").textContent = completed
    document.getElementById("pendingTasks").textContent = pending
    document.getElementById("importantTasks").textContent = important
  }

  updateTabCounts() {
    const total = this.tasks.length
    const active = this.tasks.filter((task) => !task.completed).length
    const completed = this.tasks.filter((task) => task.completed).length
    const important = this.tasks.filter((task) => task.important).length

    document.getElementById("allCount").textContent = total
    document.getElementById("activeCount").textContent = active
    document.getElementById("completedCount").textContent = completed
    document.getElementById("importantCount").textContent = important
  }

  updateCategoryFilter() {
    const categories = [...new Set(this.tasks.map((task) => task.category).filter(Boolean))]
    const select = document.getElementById("categoryFilter")

    // Clear existing options except "All Categories"
    while (select.children.length > 1) {
      select.removeChild(select.lastChild)
    }

    // Add category options
    categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category
      option.textContent = category
      select.appendChild(option)
    })
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString()
    }
  }

  getRelativeTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  saveTasks() {
    try {
      localStorage.setItem("todoTasks", JSON.stringify(this.tasks))
    } catch (error) {
      console.error("Error saving tasks:", error)
      this.showAlert("Error saving tasks!", "danger")
    }
  }

  loadTasks() {
    try {
      const tasks = localStorage.getItem("todoTasks")
      return tasks ? JSON.parse(tasks) : []
    } catch (error) {
      console.error("Error loading tasks:", error)
      return []
    }
  }

  resetAddForm() {
    document.getElementById("addTaskForm").reset()
    document.getElementById("taskDueDate").min = new Date().toISOString().split("T")[0]
  }

  createToastContainer() {
    if (!document.querySelector(".toast-container")) {
      const container = document.createElement("div")
      container.className = "toast-container"
      document.body.appendChild(container)
    }
  }

  // Responsive utilities
  initResponsiveFeatures() {
    this.handleViewportChanges()
    this.optimizeForTouch()
    this.handleOrientationChange()
  }

  handleViewportChanges() {
    const mediaQuery = window.matchMedia("(max-width: 768px)")

    const handleViewportChange = (e) => {
      if (e.matches) {
        // Mobile view
        this.enableMobileOptimizations()
      } else {
        // Desktop view
        this.enableDesktopOptimizations()
      }
    }

    mediaQuery.addListener(handleViewportChange)
    handleViewportChange(mediaQuery) // Initial check
  }

  enableMobileOptimizations() {
    // Show task actions by default on mobile
    document.querySelectorAll(".task-actions").forEach((actions) => {
      actions.style.opacity = "1"
    })

    // Adjust modal sizes
    document.querySelectorAll(".modal-dialog").forEach((modal) => {
      modal.style.margin = "1rem"
      modal.style.maxWidth = "calc(100% - 2rem)"
    })

    // Enable swipe gestures (basic implementation)
    this.enableSwipeGestures()
  }

  enableDesktopOptimizations() {
    // Hide task actions until hover on desktop
    document.querySelectorAll(".task-actions").forEach((actions) => {
      actions.style.opacity = "0"
    })

    // Reset modal sizes
    document.querySelectorAll(".modal-dialog").forEach((modal) => {
      modal.style.margin = ""
      modal.style.maxWidth = ""
    })
  }

  optimizeForTouch() {
    // Check if device supports touch
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      document.body.classList.add("touch-device")

      // Increase touch targets
      const style = document.createElement("style")
      style.textContent = `
        .touch-device .task-action-btn,
        .touch-device .task-checkbox {
          min-width: 44px !important;
          min-height: 44px !important;
        }
        .touch-device .btn {
          min-height: 44px !important;
        }
      `
      document.head.appendChild(style)
    }
  }

  handleOrientationChange() {
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.adjustLayoutForOrientation()
      }, 100)
    })
  }

  adjustLayoutForOrientation() {
    const isLandscape = window.orientation === 90 || window.orientation === -90

    if (isLandscape && window.innerHeight < 500) {
      // Compact landscape mode
      document.body.classList.add("landscape-compact")
    } else {
      document.body.classList.remove("landscape-compact")
    }
  }

  enableSwipeGestures() {
    let startX, startY, distX, distY
    const threshold = 100 // minimum distance for swipe

    document.addEventListener("touchstart", (e) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
    })

    document.addEventListener("touchend", (e) => {
      if (!startX || !startY) return

      const touch = e.changedTouches[0]
      distX = touch.clientX - startX
      distY = touch.clientY - startY

      // Check if it's a horizontal swipe
      if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold) {
        const taskItem = e.target.closest(".task-item")
        if (taskItem) {
          if (distX > 0) {
            // Swipe right - mark as complete
            const taskId = Number.parseInt(taskItem.dataset.id)
            window.todoApp.toggleTask(taskId)
          } else {
            // Swipe left - show actions or delete
            window.todoApp.showTaskActions(taskItem)
          }
        }
      }

      startX = startY = null
    })
  }

  showTaskActions(taskItem) {
    const actions = taskItem.querySelector(".task-actions")
    if (actions) {
      actions.style.opacity = "1"
      actions.style.transform = "translateX(0)"

      // Hide after 3 seconds
      setTimeout(() => {
        actions.style.opacity = "0"
      }, 3000)
    }
  }

  // Enhanced toast positioning for mobile
  showToast(message, type = "info") {
    const toastContainer = document.querySelector(".toast-container")
    const toastId = "toast-" + Date.now()

    // Adjust positioning for mobile
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      toastContainer.style.left = "10px"
      toastContainer.style.right = "10px"
      toastContainer.style.top = "10px"
    }

    const toastHTML = `
      <div id="${toastId}" class="toast custom-toast toast-${type}" role="alert">
        <div class="toast-header">
          <i class="fas fa-${this.getToastIcon(type)} me-2"></i>
          <strong class="me-auto">${this.getToastTitle(type)}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `

    toastContainer.insertAdjacentHTML("beforeend", toastHTML)

    const toastElement = document.getElementById(toastId)
    const toast = new window.bootstrap.Toast(toastElement, { delay: 3000 })
    toast.show()

    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove()
    })
  }

  getToastIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    }
    return icons[type] || icons.info
  }

  getToastTitle(type) {
    const titles = {
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Info",
    }
    return titles[type] || titles.info
  }

  showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    alertDiv.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

    document.body.appendChild(alertDiv)

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 3000)
  }
}

// Update the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  // Set minimum date for date inputs
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("taskDueDate").min = today
  document.getElementById("editTaskDueDate").min = today

  // Initialize the app
  window.todoApp = new TodoApp()

  // Initialize responsive features
  window.todoApp.initResponsiveFeatures()
})
