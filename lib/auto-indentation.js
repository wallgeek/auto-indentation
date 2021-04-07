'use babel';

import { CompositeDisposable } from 'atom';

export default {
  modalPanel: null,
  subscriptions: null,

  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.workspace.observeActiveTextEditor(editor => {
      this.toggle()
    }))
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  toggle() {
    const editor = atom.workspace.getActiveTextEditor();

    if(editor){
      const text = editor.getText()
      const originalTabLength = atom.config.get("editor.tabLength")
      const tabLength = this.getIndentation(text) || originalTabLength

      atom.config.set("editor.tabLength", tabLength)

      if(originalTabLength !== tabLength) atom.notifications.addInfo(
        "Tab length has been set to " + tabLength
      )
    }

    return
  },

  getIndentation(text) {
    let lines = text.split(/\n/).filter(ele => ele.length) // empty filter

    lines = this.ignoreComments(lines)

    const map = {}
    let total = ((lines, limit) => lines > limit ? limit : lines)(lines.length, 1000)
    let diffList = []
    let tabList = []

    for (var i = 0; i < total; i++) {
      tabList.push(this.getLeadingWhitespaces(lines[i]))
    }

    for (var i = 0; i < tabList.length - 1; i++) {
      let diff = tabList[i + 1] - tabList[i]

      if(diff < 0) diff = diff * -1
      if(diff !== 0) diffList.push(diff) // only push when the value is not zero
    }

    return this.maxOccurance(diffList)
  },

  ignoreComments (lineList) {
    // /**//**/ This case has not been handled
    let isMultiLineComment = false
    let singleLinePatternList = [
      "//",
      "#",
    ]
    let multiLinePatternList = ["/\\*", "\\*/"]

    return lineList
    .filter(ele => {
      let trim = ele.trim()
      let shouldIgnore = false
      let multStartIndex = trim.search(multiLinePatternList[0])
      let multEndIndex = trim.search(multiLinePatternList[1])

      for (var i = 0; i < singleLinePatternList.length; i++) {
        if(trim.search(singleLinePatternList[i]) === 0) {
          shouldIgnore = true
          break;
        }
      }

      // check for multi line comment. This one is little tricky
      if(multStartIndex === 0 || isMultiLineComment) shouldIgnore = true // If multi line pattern start at the beginning then ignore otherwise don't ignore

      let filter = shouldIgnore

      if(multStartIndex >= 0) isMultiLineComment = true
      if(multEndIndex >= 0) isMultiLineComment = false

      return !filter
    })
  },

  getLeadingWhitespaces(line) {
    const wordsList = line.split(" ")
    let count = 0

    for (var i = 0; i < wordsList.length; i++) {
      if(wordsList[i] === "") count++
      else break;
    }

    return count

  },

  maxOccurance(array) {
    //Maximum occurance in an array in O(1) space. Using sorting
    let sortedList = array.sort((a, b) => a - b)
    let count = 1
    let maxValue = sortedList[0]
    let maxCount = 0

    for (var i = 1; i < sortedList.length; i++) {
      if(sortedList[i - 1] === sortedList[i]) count++
      else {
        if(count > maxCount) {
          maxCount = count
          maxValue = sortedList[i - 1]
        }
        count = 1
      }
    }

    return maxValue
  }

};
