// us-en strings for the Web site

const Localization = {
  help: {
    Contents: `Contents`,
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
        <li><topic>Video and Audio</topic>: For fun, you can play Web audio clips or YouTube clips, such as "Houston, we have a problem" </li>
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
}
