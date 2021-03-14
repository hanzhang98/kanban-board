/*
 * 
 * @author Han Zhang
 */
const newCard = {
    name: 'Enter Task',
    editingTaskName: false,
    details: "Enter Description",
    editingTaskDetails: false,
    color: "light",
    deadline: "Select Deadline",
    editingDeadline: false,
    filter: true,
    comments: [
        {
            "text": "Enter Comment",
            "editingComment": false
        }
    ],
    tags: [],
};

const newComment = {
    text: 'Enter Comment',
    editingComment: false,
};

const app = new Vue({
    data() {
        return {
            sampleData: {},
            color: '#92c3d9',
            todayDate: new Date(),
            globalTags: [
                {
                    "name": "urgent",
                },
                {
                    "name": "info",
                },
                {
                    "name": "completed",
                }
            ],
            globalEdit: {
                showModal: false,
                currentTask: null,
                newTag: '',
                selectedTag: '',
                filterContents: '',
            },
            search: {
                searching: false,
                searchOptions: ['All', 'Title', 'Description', 'Tags', 'Comments'],
                selectSearchOption: 'All',
                searchTerm: 'Enter Text',
            }
        };
    },
    methods: {
        async loadData() {
            try {
                const response = await fetch('./data.json');
                const responseJson = await response.json();
                this.sampleData = responseJson;
            } catch (error) {
                console.error(error);
            }
        },
        // Method to create a tag given name and color entered by user
        createTag() {
            const newTag = {
                name: this.globalEdit.newTag,
            };
            this.globalTags.push(newTag);
            this.clearTagInputs();
        },
        
        clearTagInputs() {
            this.globalEdit.newTag = '';
        },
        editBoardName(bool) {
            this.sampleData.editingBoardName = bool;
        },
        editListName(listIndex, bool) {
            this.sampleData.lists[listIndex].editingListName = bool;
        },
        editTaskName(listIndex, taskIndex, bool) {
            this.sampleData.lists[listIndex].tasks[taskIndex].editingTaskName = bool;
        },
        editDescription(listIndex, taskIndex, bool) {
            this.sampleData.lists[listIndex].tasks[taskIndex].editingTaskDetails = bool;
        },
        editDeadline(listIndex, taskIndex, bool) {
            this.sampleData.lists[listIndex].tasks[taskIndex].editingDeadline = bool;
        },
        editComment(listIndex, taskIndex, commentIndex, bool) {
            this.sampleData.lists[listIndex].tasks[taskIndex]
                .comments[commentIndex].editingComment = bool;
        },
        createNewList() {
            this.sampleData.lists.push({
                name: 'Enter Title',
                editingListName: false,
                tasks: [],
            });
        },
        createNewCard(listIndex) {
            this.sampleData.lists[listIndex].tasks.push({ ...newCard });
        },
        createNewComment(listIndex, taskIndex) {
            this.sampleData.lists[listIndex].tasks[taskIndex].comments.push({ ...newComment });
            this.editComment(listIndex, taskIndex,
                this.sampleData.lists[listIndex].tasks[taskIndex].comments.length - 1, true);
        },
        deleteList(list) {
            this.sampleData.lists.splice(this.sampleData.lists.indexOf(list), 1);
        },
        deleteTask(list, task) {
            list.splice(list.indexOf(task), 1);
        },
        deleteComment(task, comment) {
            task.splice(task.indexOf(comment), 1);
        },
        deleteTag(task, tag) {
            task.tags.splice(task.tags.indexOf(tag.name), 1);
        },
        // editing with the modal
        editWithModal(item) {
            this.globalEdit.showModal = true;
            this.globalEdit.currentTask = item;
        },
        duplicateList(listIndex) {
            this.sampleData.lists.splice(listIndex, 0,
                JSON.parse(JSON.stringify(this.sampleData.lists[listIndex])));
        },
        duplicateCard(listIndex, taskIndex) {
            this.sampleData.lists[listIndex].tasks.splice(taskIndex, 0,
                JSON.parse(JSON.stringify(this.sampleData.lists[listIndex].tasks[taskIndex])));
        },
        searchStart() {
            this.search.searching = true;
            this.sampleData.lists.forEach((list) => {
                list.tasks.forEach((card) => {
                    card.filter = false;
            })});
            if (this.search.selectSearchOption === 'All') {
                this.searchTitle();
                this.searchDescription();
                this.searchComment();
                this.searchTag();
            } else if (this.search.selectSearchOption === 'Title') {
                this.searchTitle();
            } else if (this.search.selectSearchOption === 'Description') {
                this.searchDescription();
            } else if (this.search.selectSearchOption === 'Comments') {
                this.searchComment();
            } else if (this.search.selectSearchOption === 'Tags') {
                this.searchTag();
            }
        },

        searchTitle() {
            this.sampleData.lists.forEach((list) => {
                list.tasks.forEach((card) => {
                    if (card.name.toLowerCase().includes(this.search.searchTerm.toLowerCase())) {
                        card.filter = true;
                    }
                });
            });
        },

        searchDescription() {
            this.sampleData.lists.forEach((list) => {
                list.tasks.forEach((card) => {
                    if (card.details.toLowerCase()
                        .includes(this.search.searchTerm.toLowerCase())) {
                        card.filter = true;
                    }
                });
            });
        },

        searchComment() {
            this.sampleData.lists.forEach((list) => {
                list.tasks.forEach((card) => {
                    card.comments.forEach((comment) => {
                        if (comment.text.toLowerCase()
                            .includes(this.search.searchTerm.toLowerCase())) {
                            card.filter = true;
                        }
                    });
                });
            });
        },

        searchTag() {
            this.sampleData.lists.forEach((list) => {
                list.tasks.forEach((card) => {
                    card.tags.forEach((tag) => {
                        if (tag.name.toLowerCase()
                            .includes(this.search.searchTerm.toLowerCase())) {
                            card.filter = true;
                        }
                    });
                });
            });
        },

        clearSearch() {
            this.search.searchTerm = '';
            this.sampleData.lists.forEach((list) => {
                list.tasks[0].filter = true;
            });
            this.search.searching = false;
        },
        // Identifies start drag, saves info that will be transferred to new list
        startDrag: (evt, taskIndex, listIndex) => {
            evt.dataTransfer.dropEffect = 'move';
            evt.dataTransfer.effectAllowed = 'move';
            evt.dataTransfer.setData('currentTask', taskIndex);
            evt.dataTransfer.setData('currentList', listIndex);
        },
        // Settles dropped card, adds info from the previous list to the new list. Deletes card from previous listt
        onDrop(evt, dropList) {
            const taskIndex = evt.dataTransfer.getData('currentTask');
            const listIndex = evt.dataTransfer.getData('currentList');
            this.sampleData.lists[dropList].tasks.push(this.sampleData.lists[listIndex].tasks[taskIndex]);
            this.sampleData.lists[listIndex].tasks.splice(taskIndex, 1);
            this.$forceUpdate();
        },

    },
    watch: {
        selectTag() {
            this.globalEdit.currentTask.tags.push(this.globalEdit.selectedTag);
        },
    },
    created() {
        this.loadData();
    },
    computed: {
        // Computed being used to watch nested data
        selectTag() {
            return this.globalEdit.selectedTag;
        },
        validTag() {
            return (
                this.globalEdit.newTag.length > 0 &&
                this.globalTags.filter((tag) => tag.name === this.globalEdit.newTag)
                    .length === 0
            );
        },
    },
});
app.$mount('#app');
