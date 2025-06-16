import Image from "next/image";
import styles from "@/styles/Landingpage.module.css";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Head from "next/head";

export default function Home() {

  const [isLoading, setIsLoading] = useState(false);
  const [visibleWords, setVisibleWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typingDefinition, setTypingDefinition] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [ words, setWords ] = useState([])
  const [ stats, setStats ] = useState({})
  const [ letters, setLetters ] = useState("")
  const [ isButtonLoading, setIsButtonLoading ] = useState(false)
  const [ error, setError ] = useState("")
  const [ formerLetters, setFormerLetters ] = useState("")
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const wordsWrapperRef = useRef(null);
  const scrollTimeoutRef = useRef(null);


  const handleSearchChange = (e) => {
     const regexOnlyAlphabets = /^[a-zA-Z]*$/;
     if(!regexOnlyAlphabets.test(e.target.value)) return;
     setLetters(e.target.value)
  } 


  const startAnimation = async () => {
    setIsButtonLoading(true)
    if( letters.length < 2 || letters.length > 9 ) {
      setError("Letters can not be less than 2 or more than 9")
      setIsButtonLoading(false)
      return;
    }
    if( formerLetters == letters ){
      setIsButtonLoading(true)
      setTimeout(() => {
        setIsButtonLoading(false)
      }, 2500);
      return;
    }
    setIsLoading(false)
    setError("")
    setFormerLetters(letters)
    setVisibleWords([]);
    setCurrentWordIndex(0);
    setTypingDefinition('');
    setIsTypingComplete(false);

      try {
        const res = await axios.post(`http://localhost:5000/api/find-words`, { letters } ) 
        console.log(res)
        setWords(res.data.words)
        setStats(res.data.stats)
        setIsButtonLoading(false)
        setIsLoading(true); 
      } catch (error) {         
        console.log(error)
        setIsButtonLoading(false)
      }

  };

  const stopAnimation = () => {
    setIsLoading(false);
    setVisibleWords([]);
    setCurrentWordIndex(0);
    setTypingDefinition('');
    setIsTypingComplete(false);
  };


  useEffect(() => {
     
    if (!isLoading || currentWordIndex >= words.length){
      setIsLoading(false)
      return;
    } 

    const currentWord = words[currentWordIndex];
    const fullText = currentWord.definition ;
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypingDefinition(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
        
        // Add complete answer to visible answers after typing is done
        setTimeout(() => {
          setVisibleWords(prev => [...prev, currentWord]);
          setCurrentWordIndex(prev => prev + 1);
          setTypingDefinition('');
          setIsTypingComplete(false);
        }, 500);
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, [isLoading, currentWordIndex, words]);



  useEffect(() => {
    const handleScroll = () => {
      if (!isLoading) return;
      
      setAutoScrollEnabled(false);
      setIsUserScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
     
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
        setAutoScrollEnabled(true);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    if (wordsWrapperRef.current && isLoading && autoScrollEnabled && !isUserScrolling) {
      wordsWrapperRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
  }, [visibleWords, currentWordIndex, isLoading, autoScrollEnabled, isUserScrolling]);


  return (
    <>
      <Head>
        <title> SCRABBLEATOR </title>
        <meta
          name="description"
          content="AI for finding valid scrabble words from any letters"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.landing_page_wrapper} >
          <ul className={styles.wapp_name_wrapper} >
              <li className={styles.stext} > S </li>
              <li className={styles.ctext} > C </li>
              <li className={styles.rtext} > R </li>
              <li className={styles.atext} > A </li> 
              <li className={styles.btext} > B </li>
              <li className={styles.b2text} > B </li>
              <li className={styles.ltext} > L </li>
              <li className={styles.etext} > E </li>
              <li className={styles.a2text} > A </li>
              <li className={styles.ttext} > T </li>
              <li className={styles.otext} > O </li>
              <li className={styles.rtext} > R </li>
          </ul>
          <div className={styles.prompt_box_wrapper} >
              <h1> Scrabble AI Word Finder </h1>
              <p> Write the letters in the input box and our AI finds valid words that can be formed from those letters. </p>
              <div className={styles.input_button_box} >
                <div className={styles.input_wrapper} > 
                  <label> Input Letters </label> 
                  <input type="text" placeholder="Input your letters...." value={letters} onChange={handleSearchChange} />
                </div> 
                {
                  isButtonLoading ?
                  <ul className={styles.box_wrap} >
                    <li className={styles.left_search} > S </li>
                    <li className={styles.right_search} > E </li>
                    <li className={styles.left_search} > A </li>
                    <li className={styles.right_search} > R </li> 
                    <li className={styles.left_search} > C </li>
                    <li className={styles.right_search} > H </li>
                    <li className={styles.left_search} > I </li>
                    <li className={styles.right_search} > N </li>
                    <li className={styles.left_search} > G </li>
                  </ul>
                  :
                  <button onClick={startAnimation} > Find Words  </button>
                }
              </div>
          </div> 
          <div className={styles.found_word_wrapper} >
              <ul className={styles.stats_ul} >
                <li> Total Words: <span> { stats?.totalWords || "" } </span> </li>
                <li> Max Points: <span> { stats?.maxPoints || "" } </span> </li>
                <li> Min Points: <span> { stats?.minPoints || "" } </span> </li>
                <li> Average Length: <span> { stats?.averageLength || "" } </span> </li>
                <li> Average Points: <span> { stats?.averagePoints || "" } </span> </li>
              </ul>
              <ul className={styles.stats_ul} >
                {
                  ( Object.keys(stats).length > 0 && Object.keys(stats.lengthDistribution).length > 0 )
                  &&
                  Object.entries(stats.lengthDistribution).map( ([key, value]) => (
                    <li key={key} > {key} letter words: <span> {value} </span>  </li>
                  ) )
                }
              </ul>
              <div className={styles.words_wrapper} ref={wordsWrapperRef} >
                {/* Render completed answers */}
                {visibleWords.map((word, index) => (
                  <p key={index} style={{ opacity: 1, transform: 'translateY(0)' }}>
                    <span>{word.points} points</span>
                    <strong>{word.word}: </strong>
                    <i>{word.definition}</i>
                  </p>
                ))}
                
                {/* Render currently typing answer */}
                {isLoading && currentWordIndex < words.length && (
                  <p style={{ 
                    opacity: 1, 
                    transform: 'translateY(0)',
                    animation: 'fadeInUp 0.3s ease-out'
                  }}>
                    <span>{words[currentWordIndex].points} points</span>
                    <strong>{words[currentWordIndex].word}: </strong>
                    <i>
                      {typingDefinition}
                      {!isTypingComplete && (
                        <b style={{
                          display: 'inline-block',
                          width: '2px',
                          height: '1em',
                          backgroundColor: '#20C905',
                          marginLeft: '2px',
                          animation: 'blink 1s infinite'
                        }}></b>
                      )}
                    </i>
                  </p>
                )}
              </div>
          </div>
      </div>
    </>
  )
}
