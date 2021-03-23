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
    const lines = text.split(/\n/)
    .filter(ele => ele.length) // empty filter
    .filter(ele => {
      let trim = ele.trim()

      return !(
        trim.charAt(0) === "/" && (trim.charAt(0) === "/" || trim.charAt(0) === "*")
        || trim.charAt(0) === "*"
        || trim.charAt(0) === "#"
      )
    }) // remove comment lines

    const map = {}
    let total = ((lines, limit) => lines > limit ? limit : lines)(lines.length, 1000)
    let diffList = []

    for (var i = 0; i < total; i++) {
      let count = this.getLeadingWhitespaces(lines[i])
      map[count] = count
    }

    let sortedList = Object.values(map).sort((a, b) => a - b)

    for (var i = 0; i < sortedList.length - 1; i++) {
      diffList.push(sortedList[i + 1] - sortedList[i])
    }

    return this.maxOccurance(diffList)
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
      else count = 1

      if(count > maxCount) {
        maxCount = count
        maxValue = sortedList[i - 1]
      }
    }

    return maxValue
  }

};
