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
  // only translate the label and text property values
  initialFavorites: {
    columns: [
      { categories: [
        	{ label: 'Clips', expanded: true, items: [
            { type: 'youtube', label: 'johnny1', videoId: 'WZKmsA8bzao', startAt: 25.5, endAt: 39 },
            { type: 'youtube', label: 'johnny2', videoId: 'gpCUMdfRa9w', startAt: 67, endAt: 71 },
        		{ type: 'audio', label: 'Disappointed!', url: 'http://www.montypython.net/sounds/wanda/disappointed.wav'},
        		{ type: 'audio', label: 'Inconceivable!', url: 'http://www.moviesoundclips.net/download.php?id=2900&ft=mp3'},
            { type: 'audio', label: 'Excellent!', url: 'http://www.billandted.org/sounds/ea/eaexcellent.mp3'},
            { type: 'youtube', label: 'gehrig1', videoId: 'qswig8dcEAY', startAt: 5, endAt: 16 },
            { type: 'youtube', label: 'gehrig2', videoId: 'OyT4mPBe4YQ', startAt: 150, endAt: 165 },
            { type: 'youtube', label: 'home', videoId: 'RPs2Y4FdGzM', startAt: 143, endAt: 153 },
            { type: 'youtube', label: 'tara', videoId: 'c_WkyalPOEI', startAt: 32, endAt: 999 },
            { type: 'youtube', label: 'kind', videoId: 'l4V8OHy0su0', startAt: 50, endAt: 60 },
            { type: 'youtube', label: 'houston', videoId: 'Bti9_deF5gs', startAt: 25, endAt: 150 },
            { type: 'youtube', label: 'stupid', videoId: 'cJe6-afGz0Q', startAt: 4, endAt: 999 },
            { type: 'youtube', label: 'crying', videoId: 'Xx8cCDthsuk', startAt: 50, endAt: 56 },
            { type: 'youtube', label: 'pretty', videoId: 'lT8qgvgk1rU', startAt: 98, endAt: 106 },
            { type: 'youtube', label: 'kenny', videoId: 'kXxr9A_UBG4', startAt: 10, endAt: 16 },
            { type: 'youtube', label: 'missed', videoId: 'oPwrodxghrw', startAt: 2.5, endAt: 7.5 },
            { type: 'youtube', label: 'to me?', videoId: 'tp6KExqs_3o', startAt: 0, endAt: 7.5 },
            { type: 'youtube', label: 'les', videoId: 'dROwEc4VyJA', startAt: 84, endAt: 93 },
            { type: 'youtube', label: 'friend', videoId: 'AVQ8byG2mY8', startAt: 11, endAt: 17 },
            { type: 'youtube', label: 'hasta', videoId: 'PnYu23SseHs', startAt: 46, endAt: 51 },
            { type: 'youtube', label: 'yippie', videoId: '4XEaeOxqy_4', startAt: 20.5, endAt: 25 },
            { type: 'youtube', label: 'punk', videoId: '8Xjr2hnOHiM', startAt: 109, endAt: 135 },
            { type: 'youtube', label: 'gin', videoId: '09g2PzusuzI', startAt: 24, endAt: 32 },
            { type: 'youtube', label: 'bumpy', videoId: 'yKHUGvde7KU', startAt: 3, endAt: 10 },
            { type: 'youtube', label: 'mad', videoId: 'tUY05_ZwFzg', startAt: 0, endAt: 999 },
            { type: 'youtube', label: 'failure', videoId: 'V2f-MZ2HRHQ', startAt: 2, endAt: 999 },
            { type: 'youtube', label: 'betcha', videoId: 'fv9XtSiqEDA', startAt: 0, endAt: 999 },
            { type: 'youtube', label: 'fraud', videoId: 'AC9z7LIQX_A', startAt: 0, endAt: 999 },
            { type: 'youtube', label: 'bro', videoId: 'QkkLUP-gm4Q', startAt: 114, endAt: 119 },
            { type: 'text', label: 'hello', text: "You had me at hello"},
            { type: 'text', label: 'girl', text: "I'm just a girl, standing in front of a boy, asking him to love her"},
        	]},
        ]
      },
      { categories: [
        { label: 'Care Requests', expanded: true, items: [
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
        { label: 'Adjustments', expanded: true, items: [
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
        { label: 'Other', expanded: true, items: [
          { type: 'text', label: 'thanka', text: 'Thank you. You are an angel.'},
          { type: 'text', label: 'Pepe', text: 'Can someone please help Peppay? '},
          { type: 'text', label: 'vgood', text: "very good"},
          { type: 'text', label: 'perfect', text: "perfect"},
          { type: 'text', label: 'wonful', text: "wonderful"},
          { type: 'text', label: 'g-aft', text: 'good afternoon'},
          { type: 'text', label: 'g-eve', text: 'good evening'},
          { type: 'text', label: 'g-night', text: 'good night'},
          { type: 'text', label: 'lol', text: "L O L"},
          { type: 'text', label: 'testing', text: 'Please ignore what comes out of the computer for the next couple of minutes. I am just testing the software. '},
        ]},
      ]},
      { categories: [
        { label: 'Basic', expanded: true, items: [
          { type: 'text', label: 'nevermind', text: 'Sorry. Mistake. Ignore what I just said.'},
          { type: 'text', label: 'help', text: 'Please come and help me'},
          { type: 'text', label: 'yes', text: 'yes'},
          { type: 'text', label: 'no', text: 'no'},
          { type: 'text', label: 'OK', text: 'OK'},
          { type: 'text', label: 'good', text: "good"},
          { type: 'text', label: 'still', text: "still not right"},
          { type: 'text', label: 'gaze trouble', text: "I am having trouble with my eye gaze at the moment, so I may not be able to answer questions. Maybe try asking me questions that have yes and no answers. "},
        ]},
        { label: 'Pleasantries', expanded: true, items: [
          { type: 'text', label: 'please', text: 'Please.'},
          { type: 'text', label: 'thankyou', text: 'Thank you.'},
          { type: 'text', label: 'hello', text: 'hello'},
          { type: 'text', label: 'goodbye', text: 'goodbye'},
          { type: 'text', label: 'g-morn', text: 'good morning'},
          { type: 'text', label: 'howRU', text: 'how are you'},
        ]},
        { label: 'Adjustments', expanded: true, items: [
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
      ]},
    ]
  },  
}
