'use strict';
const emojiInfo  	= require('./emoji.json'); // provided by gemoji (https://github.com/github/gemoji)
const gitmojiInfo	= require('./gitmojis.json'); // provided by gitmoji (https://github.com/carloscuesta/gitmoji)

module.exports = {getSublimeCompletions,};

writeSublimeConfig()

function prettyPrintArray(s) {
  return s
    .replace(/\"\[/g	,'[')
    .replace(/\]\"/g	,']')
    .replace(/\"\{/g	,'{')
    .replace(/\}\"/g	,'}')
    .replace(/\\\"/g	,'\"')
    .replace(/\\\\/g	,'\\')
}
function replacer(key,value) { // this = object in which the key was found is provided as the replacer's this context
  const p = console.log;
  if ((value.constructor === Array)
    &&(value.length === 2)) { return JSON.stringify(value,undefined,0)}
  return value
}
function writeSublimeConfig() {
  const FileSystem = require("fs");
  const sublConfig = getSublimeConfig()
  let uglyprint = JSON.stringify(sublConfig,replacer,"  ");
  let prettyprint = prettyPrintArray(uglyprint);
  FileSystem.writeFile('GithubEmoji.sublime-settings', prettyprint, (error) => {if (error) throw error;});
}
function getSublimeConfig() {
  let jsonConfig = {};
  jsonConfig.emojiCompletions      	= getSublimeCompletions()
  jsonConfig.commitEmojiCompletions	= getSublimeCompletions_gitmoji()
  jsonConfig.emojiScopes           	= ["text.html.markdown","text.git-commit","text.git.commit"]
  jsonConfig.emojiFileNames        	= ["COMMIT_EDITMSG"]
  return jsonConfig
}
function getSublimeCompletions_gitmoji() {
  const completions = [];
  //{"emoji":"🔖","entity":"&#x1f516;","code":":bookmark:","description":"Release / Version tags."
  //,"name":"bookmark","semver":null},
  gitmojiInfo.gitmojis.forEach(function (emoji, emojiIndex) {
    const name          	= stringOrEmpty(emoji.name);                                           	// bookmark
    const code          	= stringOrEmpty(emoji.code);                                           	//:bookmark:
    const description   	= stringOrEmpty(emoji.description.replace(/\.$/,''));                  	//Release / Version tags
    const trigger       	= stringOrEmpty(name) + prepend(' ',stringOrEmpty(emoji.emoji));       	// bookmark 🔖
    const triggerRev    	= stringOrEmpty(description) + prepend(' ',stringOrEmpty(emoji.emoji));	// Release / Version tags 🔖
    const tabTrigger    	= prepend('@' ,trigger);                                               	//@bookmark 🔖
    const tabTriggerC   	= prepend('@,',trigger);                                               	//@,bookmark 🔖
    const tabTriggerRev 	= prepend('@' ,triggerRev);                                            	//@Release / Version tags 🔖
    const tabTriggerRevC	= prepend('@,',triggerRev);                                            	//@,Release / Version tags 🔖
    if (! name) {console.log(`${stringOrEmpty(emoji.emoji)} ${stringOrEmpty(emoji.code)} has no name, skipping`);return;}
    if (! code) {console.log(`${stringOrEmpty(emoji.emoji)} ${stringOrEmpty(emoji.name)} has no code, skipping`);return;}
    //               ["@bookmark 🔖\tversion tag", ":bookmark:"]
    //               ["@,bookmark 🔖\tversion tag", "🔖"]
    completions.push([tabTrigger    	+ prepend('\t',stringOrEmpty(description)	), code]);
    completions.push([tabTriggerC   	+ prepend('\t',stringOrEmpty(description)	), emoji.emoji]);
    completions.push([tabTriggerRev 	+ prepend('\t',stringOrEmpty(name)       	), code]);
    completions.push([tabTriggerRevC	+ prepend('\t',stringOrEmpty(name)       	), emoji.emoji]);
    //               ["@version tag 🔖\t:bookmark:", ":bookmark:"],
    //               ["@,version tag 🔖\t:bookmark:", "🔖"],
  });
  return completions;
}
function getSublimeCompletions() {
  const completions = [];
  // {"emoji":"😀","description":"grinning face","category":"People","aliases":["grinning"]
   // ,"tags":["smile","happy"],"unicode_version":"6.1","ios_version":"6.0"}
  emojiInfo      .forEach(function (emoji, emojiIndex) {
    emoji.aliases.forEach(function (alias, aliasIndex) {
      const content    	= prepend(':', append (':', stringOrEmpty(alias)));   //:grinning:
      const contentC   	= prepend(':,', append (':', stringOrEmpty(alias)));   //:,grinning:
      const tabTrigger 	= content + prepend(' ', stringOrEmpty(emoji.emoji)); //:grinning: 😀
      const tabTriggerC	= contentC + prepend(' ', stringOrEmpty(emoji.emoji)); //:,grinning: 😀
      const description	= stringOrEmpty(emoji.description);                   //grinning face
      //               [":grinning: 😀\tgrinning face"                       , ":grinning:"]
      completions.push([tabTrigger 	+ prepend('\t',stringOrEmpty(description)), content]);
      completions.push([tabTriggerC	+ prepend('\t',stringOrEmpty(description)), emoji.emoji]);
      //               [":,grinning: 😀\tgrinning face"                       , "😀"]
    });
  });
  return completions;
}

function stringOrEmpty(s) {return s ? s.toString() : '';}
function append(suffix, s) {
  s      = s      || '';
  suffix = suffix || '';
  return s ? s.toString() + suffix : '';
}
function prepend(prefix, s) {
  s      = s      || '';
  prefix = prefix || '';
  return s ? prefix + s.toString() : '';
}
