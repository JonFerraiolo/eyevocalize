// us-en strings for the Web site

const Localization = {
  common: {
    'add to': `add to`,
    Cancel: `Cancel`,
    From: `From`,
    invalidUrl: `invalid URL`,
    'local file': `local file`,
    name: `name`,
    Open: `Open`,
    Size: `Size`,
    thin: `thin`,
    wide: `wide`,
    'Select all': `Select all`,
    'Deselect all': `Deselect all`,
    'Expand all': `Expand all`,
    'Collapse all': `Collapse all`,
  },
  help: {
    Contents: `Contents`,
    Starting: `Getting Started`,
    StartingContentsDesc: `Getting Started with Eyevocalize.com`,
    StartingContent: `
      <p>Welcome to the EyeVocalize browser-based text-to-speech application (beta). EyeVocalize assumes you are using eye gaze technology to communicate. It was designed by me, Jon Ferraiolo, an advanced ALS patient, around my personal needs and abilities.  </p>
      <p>My particular computer setup has:</p>
      <ul>
        <li>A Microsoft Surface laptop running Windows 10.</li>
        <li>PC Eye Mini with Windows Control 2.0 from Tobii Dynavox (eye gaze technology)</li>
        <li>Chrome, Firefox or Edge, latest version.</li>
      </ul>
      <p class="HelpVeryImportant">Things you should do soon: </p>
      <ul>
        <li><strong>Sign up and log in</strong>. The signup/login hyperlink appears in the top-right corner if you are trying out the application without signing up or logging in. </li>
        <li><strong>You should customize your Favorites</strong>. By default, EyeVocalize provides a limited set of Favorites, such as "yes", "no", "hello" and "goodbye". Press the small <icon1>import</icon1> import icon (on the Favorites section header) to review and import the various collections of add-on Favorites. </li>
        <li><strong>You should customize your settings</strong> by clicking the <icon1>gear</icon1> gear icon, particularly to customize your voice settings.</li>
        <li>You might want to skim through the various help screens at some point to get a sense of all of the features.</li>
      </ul>
      <p>You can bring up the Help window at any time by clicking on the <icon1>helpicon</icon1> question mark icon.</p>
      <p>This Help window can be repositioned and resized. Use the <icon1>size</icon1> size icon to make the Help window tall, wide, short or thin. Use the <icon1>position</icon1> position icon to move the Help window to the left, right, top, bottom or center of the application. (If you have mastered drag and drop using eye gaze, the title bar on the Help window is draggable.) </p>
    `,
    // FIXME no longer f
    Introduction: `Introduction`,
    IntroductionContentsDesc: `Introduction to Eyevocalize.com`,
    IntroductionContent: `
      <p>I, Jon Ferraiolo, a person who cannot speak or use his hands, created this application for my own use so I can not only communicate with my family and caregivers, but also participate as normally as possible in social activities. Although I tailored the software for my own needs, I tried to write the software so that others could use it, too. There are many other text-to-speech systems. I do not expect very many people will choose this application, but if you like it, great, use it. It is free with no restrictions other than don't do illegal or bad things listed in the Terms of Use. </p>
      <p>The biggest difference between Eyevocalize and older text-to-speech systems is that it runs in a browser tab. That allows you to easily transition between Web mail, Facebook, Twitter, Web browsing, Web music, streaming video, etc., and your text-to-speech application, including copy/paste to/from each. </p>
      <p>My particular computer setup has:</p>
      <ul>
        <li>A Microsoft Surface laptop (because Tobii Dynavox software requires Windows) with a current version of Windows 10. The Surface hangs about 18" in front of me. (I actually have two nearly identical systems, one for my wheelchair and one hanging over my head in bed.)</li>
        <li>PC Eye Mini with Windows Control 2.0</li>
        <li>Chrome, Firefox or Edge. I mostly use Chrome, but I have found no problems with Firefox and Edge so far. In fact, the other two seem to work better for speech synthesis. </li>
      </ul>
      <p>EyeVocalize will only be useful to people who not only have a similar technology stack, but also have a high level of proficiency using their eyes to do ordinary computer tasks such as clicking, typing and scrolling. </p>
      <p>EyeVocalize is alpha software that is maintained by me, and I am a terminally ill patient who could go at any time. The website should just keep working until it doesn't, for whatever reason. If I am not around to fix, that will probably be the end of EyeVocalize. </p>
    `,
    Features: `Features`,
    FeaturesContentsDesc: `Features in the application`,
    FeaturesContent: `
      <p>EyeVocalize features:</p>
      <ul>
        <li><topic>Type-to-speak</topic>: Type text, then press Return (or click the speak icon) to cause the typed words to be spoken using voice synthesis</li>
        <li><topic>Favorites</topic>: Ability to define your own favorites for phrases that you use repeatedly </li>
        <li><topic>Whiteboard</topic>: Ability to prepare text in advance and store on the Whiteboard for one-click speaking at just the right time </li>
        <li><topic>History</topic>: EyeVocalize saves your history of vocalizations so you can search for things you said in the past and repeat again </li>
        <li><topic>Video</topic>: For fun, you can play YouTube clips, such as "Houston, we have a problem" </li>
        <li><topic>Cloud Backup</topic>: If you sign up and login, which are recommended, EyeVocalize By default will back up your history, clipboard, favorites and some other settings to the EyeVocalize server.</li>
        <li><topic>Sync</topic>: If you have multiple eye gaze systems like me, and you allow EyeVocalize to back up your data, EyeVocalize will sync your data across all of your systems and browsers.  </li>
        <li><topic>Shortcuts</topic>: For advanced users, EyeVocalize has various keyboard shortcuts to accelerate your use of the application.  </li>
      </ul>
    `,
    "Type-to-speak": `Type-to-speak`,
    TtsContentsDesc: `Type what you want to say`,
    TtsContent: `
      <p>On the main screen of the application, you should see a <strong>Compose</strong> text input box with a type-in cursor.</p>
      <p>Bring up the onscreen keyboard from your eye gaze system. (For example, I have a Tobii Dynavox PC Eye Mini. The onscreen keyboard is part of their Windows Control software.) </p>
      <p>Type what you want to say. </p>
      <p>Press Return or click the <icon2>speak</icon2> speak icon to cause speech synthesis to vocalize using the current system voice. </p>
    `,
    Whiteboard: `Whiteboard`,
    WhiteboardContentsDesc: `Store expressions for the future`,
    WhiteboardContent: `
      <p>The Whiteboard is on the left side of the application.</p>
      <p>You can type expressions and store them on the Whiteboard for saying later. </p>
      <p>To store something on the Whiteboard, type words into the <strong>Compose</strong> text input box at the top of the application, and then either click on the <icon2>stickynote</icon2> sticky note icon or press <strong>Control-Return</strong>.  </p>
      <p>To vocalize any of the entries in the Whiteboard, click on them. </p>
      <p>On the Whiteboard title bar is a <icon1>editicon</icon1> pencil icon. If you click that icon, you can add, edit, delete, reorder or make <topic>Favorites</topic> of the items in the Whiteboard. </p>
      <p>The Whiteboard title bar also has an <icon1>addicon</icon1> plus icon, which gives you another way to add an item to the Whiteboard. </p>
    `,
    History: `History`,
    HistoryContentsDesc: `Your history of vocalizations`,
    HistoryContent: `
      <p>The History is on the left side of the application under the Whiteboard.</p>
      <p>Everything you vocalize is recorded in the History. </p>
      <p>To repeat a vocalization, click on the entry within the History.  </p>
      <p><strong>Control-period</strong> (Control plus the "." character) will repeat the most recent vocalization.  </p>
      <p>On the History title bar is a <icon1>editicon</icon1> pencil icon. If you click that icon, you go to the <strong>Manage History</strong> screen where you can search, delete and copy entries from the History to the system clipboard. </p>
      <p>On the Manage History screen, there is also a <strong>Scroll To</strong> button. This is useful for copying a sequence of vocalizations to the system clipboard. The usual sequence is to search for an entry, select that entry, click the <strong>Scroll To</strong> button to show the contemporaneous entries, multi-select desired entries and then click the <strong>Copy</strong> to copy the entries to the system clipboard, reordered in the order they were originally spoken. </p>
      <p>There is a History section on the <topic>Settings</topic> screen, available from the <icon2>gear</icon2> gear icon at the top of the application. </p>
    `,
    Favorites: `Favorites`,
    FavoritesContentsDesc: `Your favorite vocalizations`,
    FavoritesContent: `
      <p>Your list of Favorites takes up three columns of the application.</p>
      <p>Favorites are things you say regularly that you want to be only a single click away.</p>
      <p>To vocalize a favorite, simply click on that  entry.  </p>
      <p>When you open the application initially, you will see a minimal list of default Favorites. Sometime soon after you start to use EyeVocalize, set aside a block of time to build your list of things you say regularly and add those things to your Favorites.   </p>
      <p>You can import a collection of Favorites using the <icon1>import</icon1> import icon on the Favorites title bar. For example, there is a collection of Favorites called "ALS" on the EyeVocalize website that you might want to import if you have ALS like me. You can import from an EyeVocalize collection, or from a URL or your local file system if the target file is the correct format. </p>
      <p>On the Favorites title bar is a <icon1>addicon</icon1> plus icon, which is one way to define a new favorite. You can also create favorites by typing text into the <strong>Compose</strong> text box and clicking the <icon2>heart</icon2> heart icon at the top of the application. </p>
      <p>On the Favorites title bar is a <icon1>editicon</icon1> pencil icon. If you click that icon, you go to the <strong>Manage Favorites</strong> screen where you can add, edit, delete and reorder both individual favorites but also the categories.  </p>
    `,
    Shortcuts: `Shortcuts`,
    ShortcutsContentsDesc: `Keyboard shortcuts`,
    Prev: `Prev`,
    Next: `Next`,
    positionIconDesc: `bring up a menu that allows you to change the position of the help popup`,
    sizeIconDesc: `bring up a menu that allows you to change the size of the help popup`,
    closeIconDesc: `close the help popup`,
    Size: `Size`,
    max: `max`,
    min: `min`,
    tall: `tall`,
    short: `short`,
    wide: `wide`,
    thin: `thin`,
    Position: `Position`,
    'vertical': `vertical`,
    top: `top`,
    middle: `middle`,
    bottom: `bottom`,
    'horizontal': `horizontal`,
    left: `left`,
    center: `center`,
    right: `right`,
  },
  ImportFavorites: {
    AllFavoritesAlreadyLoaded: `All favorites from this collection have already been imported.`,
    CollectionLoadedFrom: `Collection of favorites loaded from`,
    fileFormatErrorNotValidJson: `Invalid file, not a valid JSON file`,
    fileFormatErrorNotValidCollectionFile: `Invalid file, not a valid collection of favorites`,
    'Import Favorites': `Import Favorites`,
    instructions: `Click on any part of a row to select.`,
    invalidFileFormat: `Invalid file format for a collection of favorites`,
    Play: `Play`,
    unknownFileLoadingError: `Unknown error attempting to load a collection of favorites`,
  },

  // only translate values of label:, category:, text: properties
  builtinFavoritesCollections: [
    { label: 'Basic', default: true, column: 3, category: 'Basic', items: [
      { type: 'text', label: 'nevermind', text: 'Sorry. Mistake. Ignore what I just said.'},
      { type: 'text', label: 'help', text: 'Please come and help me'},
      { type: 'text', label: 'yes', text: 'yes'},
      { type: 'text', label: 'no', text: 'no'},
      { type: 'text', label: 'OK', text: 'OK'},
      { type: 'text', label: 'good', text: "good"},
      { type: 'text', label: 'still', text: "still not right"},
      { type: 'text', label: 'gaze trouble', text: "I am having trouble with my eye gaze at the moment, so I may not be able to answer questions. Maybe try asking me questions that have yes and no answers. "},
    ]},
    { label: 'Pleasantries', default: true, column: 3, category: 'Pleasantries', items: [
      { type: 'text', label: 'please', text: 'Please.'},
      { type: 'text', label: 'thankyou', text: 'Thank you.'},
      { type: 'text', label: 'hello', text: 'hello'},
      { type: 'text', label: 'goodbye', text: 'goodbye'},
      { type: 'text', label: 'g-morn', text: 'good morning'},
      { type: 'text', label: 'howRU', text: 'how are you'},
    ]},
    { label: 'Opposites', default: true, column: 2, category: 'Opposites', items: [
      { type: 'text', label: 'up', text: 'Please move it up. '},
      { type: 'text', label: 'down', text: 'Please move it down. '},
      { type: 'text', label: 'left', text: 'Please move it to my left. '},
      { type: 'text', label: 'right', text: 'Please move it to my right. '},
      { type: 'text', label: 'in', text: 'Please push it in. '},
      { type: 'text', label: 'out', text: 'Please push it out. '},
      { type: 'text', label: 'forward', text: 'Please move it forward. '},
      { type: 'text', label: 'backward', text: 'Please move it Backward. '},
      { type: 'text', label: 'tighter', text: 'Please make it tighter. '},
      { type: 'text', label: 'looser', text: 'Please make it looser. '},
      { type: 'text', label: 'little', text: 'Only a small amount. '},
      { type: 'text', label: 'a lot', text: 'Quite a lot. '},
      { type: 'text', label: 'hurry', text: 'Please hurry!'},
      { type: 'text', label: 'no rush', text: 'Take your time. Not urgent'},
    ]},
    { label: 'Clips', default: true, column: 1, category: 'Clips', items: [
      { type: 'youtube', label: 'excellent', videoId: 'AKecz2ak78Y', startAt: 0, endAt: 4 },
      { type: 'youtube', label: 'betcha', videoId: 'fv9XtSiqEDA', startAt: 0, endAt: 999 },
      { type: 'youtube', label: 'houston', videoId: 'Bti9_deF5gs', startAt: 25, endAt: 150 },
      { type: 'youtube', label: 'home', videoId: 'RPs2Y4FdGzM', startAt: 143, endAt: 153 },
      { type: 'youtube', label: 'pretty', videoId: 'lT8qgvgk1rU', startAt: 98, endAt: 106 },
      { type: 'youtube', label: 'crying', videoId: 'Xx8cCDthsuk', startAt: 50, endAt: 56 },
      { type: 'youtube', label: 'gin', videoId: '09g2PzusuzI', startAt: 24, endAt: 32 },
      { type: 'youtube', label: 'bumpy', videoId: 'yKHUGvde7KU', startAt: 3, endAt: 10 },
      { type: 'youtube', label: 'tara', videoId: 'c_WkyalPOEI', startAt: 32, endAt: 999 },
      { type: 'youtube', label: 'kind', videoId: 'l4V8OHy0su0', startAt: 50, endAt: 60.5 },
      { type: 'youtube', label: 'stupid', videoId: 'cJe6-afGz0Q', startAt: 4, endAt: 999 },
      { type: 'youtube', label: 'ppgood', videoId: 'ZUOVRJ4wJ7g', startAt: 27.5, endAt: 999 },
    ]},
    { label: 'Basic additions', column: 3, category: 'Basic', items: [
      { type: 'text', label: 'vgood', text: "very good"},
      { type: 'text', label: 'perfect', text: "perfect"},
      { type: 'text', label: 'wonful', text: "wonderful"},
      { type: 'text', label: 'lol', text: "L O L"},
    ]},
    { label: 'Pleasantries additions', column: 3, category: 'Pleasantries', items: [
      { type: 'text', label: 'g-aft', text: 'good afternoon'},
      { type: 'text', label: 'g-eve', text: 'good evening'},
      { type: 'text', label: 'g-night', text: 'good night'},
    ]},
    { label: 'ALS Requests', column: 2, category: 'Care Requests', items: [
      { type: 'text', label: 'air', text: 'Can I have air?'},
      { type: 'text', label: 'mask', text: 'Can you please fix my breathing mask?'},
      { type: 'text', label: 'nebulizer', text: 'Time for nebulizer and feeding'},
      { type: 'text', label: 'stretch', text: 'Can I please stretch?'},
      { type: 'text', label: 'toilet', text: 'Take me to the toilet, please'},
      { type: 'text', label: 'urinal', text: 'can I please use the urinal'},
      { type: 'text', label: 'bed', text: 'Can I please go to my bed?'},
      { type: 'text', label: 'cold', text: 'I am a little cold. Could I please have something more over me?'},
      { type: 'text', label: 'warm', text: 'I am a little warm. Could you please take something off of me?'},
      { type: 'text', label: 'tubing', text: 'Please pull the blue tubing, you know, the tubing that goes from the breathing machine to my face mask, please pull it outside of the bed as much as possible. '},
      { type: 'text', label: 'itch', text: 'Can you please scratch something for me? '},
    ]},
    { label: 'ALS Adjustments', column: 2, category: 'Care Adjustments', items: [
      { type: 'text', label: 'hands', text: 'Please move my hands. They are uncomfortable.'},
      { type: 'text', label: 'laptop', text: 'Can you please adjust the position of the computer?'},
      { type: 'text', label: 'strap', text: 'Can you please adjust the head strap?'},
      { type: 'text', label: 'mask', text: 'Can you please adjust the mask?'},
      { type: 'text', label: 'leak', text: 'my mask is leaking'},
      { type: 'text', label: 'eyes', text: 'The eye gaze bar cannot see one of my eyes. '},
      { type: 'text', label: 'crooked', text: 'It is crooked. Please straighten.'},
      { type: 'text', label: 'hurts', text: 'It hurts. Please adjust.'},
      { type: 'text', label: 'body', text: 'Please roll me a little so that my body is flat on the bed and my head is facing straight up. '},
      { type: 'text', label: 'head', text: 'Please straighten my head '},
      { type: 'text', label: 'chair pos', text: 'Can you please fix the position of the wheelchair?'},
      { type: 'text', label: 'tilt fwd', text: 'Can you please tilt the wheelchair forward?'},
      { type: 'text', label: 'tilt back', text: 'Can you please tilt the wheelchair backward?'},
      { type: 'text', label: 'feet up', text: 'Can you please elevate my feet a little?'},
      { type: 'text', label: 'plug', text: 'Can you please plug in the computer?'},
    ]},
    { label: 'ALS Clips', column: 1, category: 'Clips', items: [
      { type: 'youtube', label: 'gehrig1', videoId: 'qswig8dcEAY', startAt: 5, endAt: 16 },
      { type: 'youtube', label: 'gehrig2', videoId: 'OyT4mPBe4YQ', startAt: 150, endAt: 165 },
    ]},
  ]
}
