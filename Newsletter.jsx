import React from 'react';

const App = () => {
  // Styles based on a "Rich Modern-Traditional" aesthetic
  const styles = {
    main: {
      backgroundColor: "#f4f1ee",
      fontFamily: '"Be Vietnam Pro", sans-serif',
      padding: '60px 0',
      minHeight: '100vh',
    },
    container: {
      margin: "0 auto",
      width: "740px",
      backgroundColor: "#ffffff",
      padding: "50px",
      borderRadius: "40px",
      boxShadow: "0 25px 50px -12px rgba(74, 44, 42, 0.15)",
      border: "1px solid rgba(74, 44, 42, 0.1)",
      position: 'relative',
      overflow: 'hidden'
    },
    ornament: {
      position: 'absolute',
      top: '25px',
      right: '25px',
      fontSize: '28px',
      color: '#e86424',
      opacity: 0.4,
      zIndex: 10
    },
    headerSection: {
      paddingBottom: '50px',
      borderBottom: '2px solid #f0f0f0',
      marginBottom: '50px',
      position: 'relative'
    },
    mainTitle: {
      fontFamily: '"Anantason", "Arial Black", sans-serif',
      fontSize: "68px",
      color: "#e86424",
      margin: "0",
      lineHeight: "0.85",
      fontWeight: '900',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      textDecoration: 'none',
      display: 'block',
      position: 'relative',
      zIndex: 5
    },
    subTitle: {
      fontFamily: '"Anantason", sans-serif',
      fontSize: "42px",
      color: "#4a2c2a",
      margin: "0",
      lineHeight: "1.1",
      fontWeight: '700',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      position: 'relative',
      zIndex: 5
    },
    logoWrapper: {
      position: 'relative',
      width: '150px',
      height: '150px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // REVERTED: Original curved square behind the logo
    logoBg: {
      position: 'absolute',
      width: '120px',
      height: '120px',
      backgroundColor: '#e86424',
      borderRadius: '45px',
      transform: 'rotate(-10deg)',
      zIndex: 1,
    },
    logo: {
      position: 'relative',
      backgroundColor: '#ffffff',
      width: '110px',
      height: '110px',
      borderRadius: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      zIndex: 2,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    },
    logoImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    spotlightHeader: {
      backgroundColor: "#ffb433",
      width: "200px",
      borderRadius: "24px 24px 0 0",
      padding: "12px 30px",
      position: 'relative',
      zIndex: 3,
      textAlign: 'center',
      border: '2px solid #4a2c2a',
      borderBottom: 'none'
    },
    spotlightText: {
      fontFamily: '"Anantason", sans-serif',
      fontWeight: "900",
      color: "#4a2c2a",
      margin: 0,
      fontSize: '14px',
      letterSpacing: '3px',
      textTransform: 'uppercase'
    },
    orangeCard: {
      backgroundColor: "#e86424",
      borderRadius: "0 40px 40px 40px",
      padding: "40px",
      marginTop: "-2px",
      border: '3px solid #4a2c2a',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)',
      position: 'relative',
      zIndex: 2
    },
    artCard: {
      backgroundColor: "#ffffff",
      borderRadius: "24px",
      padding: "18px",
      height: '100%',
      border: '1.5px solid #4a2c2a',
      boxShadow: '8px 8px 0px rgba(0,0,0,0.1)',
      textDecoration: 'none',
      display: 'block',
      color: 'inherit',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    yellowHeader: {
      backgroundColor: "#ffb433",
      padding: "14px 24px",
      borderRadius: "18px",
      marginBottom: '30px',
      border: '2px solid #4a2c2a',
      display: 'inline-block'
    },
    archiveItem: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px',
      padding: '15px',
      borderRadius: '20px',
      border: '1px solid #f0f0f0',
      backgroundColor: '#fafafa',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.3s ease',
      alignItems: 'center'
    },
    archiveImg: {
      borderRadius: "15px",
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      border: '1px solid #ddd'
    },
    archiveTitle: {
      fontFamily: '"Anantason", sans-serif',
      fontWeight: '900',
      fontSize: '16px',
      color: '#4a2c2a',
      margin: '0 0 4px 0',
      textTransform: 'uppercase'
    },
    archiveDesc: {
      fontSize: '12px',
      color: '#6b5e5d',
      lineHeight: '1.5',
      margin: 0
    },
    amateurScrapbook: {
      backgroundColor: "#fff",
      padding: "30px",
      borderRadius: "4px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      border: '1px solid #e0e0e0',
      position: 'relative',
      backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    },
    tape: {
      position: 'absolute',
      top: '-15px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100px',
      height: '35px',
      backgroundColor: 'rgba(255, 180, 51, 0.6)',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.05)',
      zIndex: 10
    },
    mailLetter: {
      backgroundColor: "#fff",
      padding: "40px",
      borderLeft: '4px solid #e86424',
      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
      marginBottom: '35px',
      fontFamily: 'serif',
    },
    footer: {
      marginTop: '60px',
      paddingTop: '30px',
      borderTop: '1px solid #eee',
      textAlign: 'center',
      fontSize: '12px',
      color: '#8a7b7a'
    },
    footerLink: {
      color: '#4a2c2a',
      textDecoration: 'none',
      borderBottom: '1px solid transparent',
      margin: '0 10px',
      transition: 'all 0.2s ease'
    },
    hoverStyle: `
      .art-card:hover {
        transform: translate(-4px, -4px);
        box-shadow: 12px 12px 0px rgba(232, 100, 36, 0.2);
        border-color: #e86424;
      }
      .archive-item:hover {
        background-color: #ffffff;
        border-color: #ffb433;
        transform: scale(1.02);
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      }
      .social-link:hover {
        color: #e86424 !important;
        border-bottom-color: #e86424 !important;
      }
      .footer-link:hover {
        color: #e86424;
        border-bottom-color: #e86424;
      }
      .submit-btn:hover {
        background-color: #e86424 !important;
        transform: translateY(-2px);
      }
    `
  };

  const archivePosts = [
    { title: "Burnt Butter Cakes", text: "Why the 'mistake' tasted better than the recipe.", img: "food1", id: 'p1' },
    { title: "Wonky Weaving", text: "My first attempt at a wall hanging. It's crooked.", img: "art4", id: 'p2' },
    { title: "The Blue Tomato", text: "Gardening for beginners: A journal of accidental anomalies.", img: "food3", id: 'p3' },
    { title: "Doodle Therapy", text: "30 days of drawing with my non-dominant hand.", img: "art5", id: 'p4' },
    { title: "Vintage Finds", text: "Scouring local markets for character over utility.", img: "art6", id: 'p5' }
  ];

  return (
    <div style={styles.main}>
      <style>{styles.hoverStyle}</style>
      <div style={styles.container}>
        <div style={styles.ornament}>✥</div>
        
        {/* --- HEADER --- */}
        <div style={styles.headerSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <a href="https://sollungomaami.com" style={styles.mainTitle}>MAAMI'S</a>
              <h2 style={styles.subTitle}>DIGEST</h2>
              <div style={{ marginTop: '20px', letterSpacing: '2px', fontSize: '11px', fontWeight: '900', color: '#8a7b7a' }}>
                <a href="https://instagram.com/sollungomaami" className="social-link" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1.5px solid #ffb433', transition: 'all 0.2s ease' }}>@SOLLUNGOMAAMI</a> 
                <span style={{ margin: '0 10px' }}>•</span> 
                <a href="https://sollungomaami.com" className="social-link" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1.5px solid #ffb433', transition: 'all 0.2s ease' }}>SOLLUNGOMAAMI.COM</a>
              </div>
            </div>
            <div style={styles.logoWrapper}>
              <div style={styles.logoBg}></div>
              <div style={styles.logo}>
                {/* Logo Image */}
                <img 
                  src="https://picsum.photos/seed/maami-logo/200/200" 
                  alt="Amateur Soul Logo" 
                  style={styles.logoImage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- SPOTLIGHT --- */}
        <div style={styles.spotlightHeader}>
          <p style={styles.spotlightText}>SPOTLIGHT</p>
        </div>
        
        <div style={styles.orangeCard}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[1, 2, 3].map((_, i) => (
              <a key={i} href={`#edition-0${i+1}`} className="art-card" style={styles.artCard}>
                <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1px', color: '#e86424', display: 'block', marginBottom: '8px' }}>EDITION 0{i+1}</span>
                <img 
                  src={`https://picsum.photos/seed/curated${i + 12}/400/300`} 
                  style={{ width: '100%', borderRadius: '12px', border: '1px solid #eee' }} 
                  alt="Spotlight" 
                />
                <p style={{ fontSize: '12px', color: '#5a4d4c', marginTop: '12px', lineHeight: '1.5' }}>
                   Finding harmony in rituals. Exploring indigenous craft.
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* --- THE ARCHIVES & SIDEBAR --- */}
        <div style={{ display: 'flex', marginTop: '60px', gap: '40px' }}>
          
          {/* Left Column: Archive Posts */}
          <div style={{ flex: '1.6' }}>
            <div style={styles.yellowHeader}>
              <p style={{ ...styles.spotlightText, fontSize: '12px' }}>THE ARCHIVES</p>
            </div>

            {archivePosts.map((post, i) => (
              <a key={i} href={`#post-${post.id}`} className="archive-item" style={styles.archiveItem}>
                <img src={`https://picsum.photos/seed/arch${i}/150/150`} style={styles.archiveImg} alt="Archive" />
                <div>
                  <h3 style={styles.archiveTitle}>{post.title}</h3>
                  <p style={styles.archiveDesc}>{post.text}</p>
                </div>
                <div style={{ marginLeft: 'auto', color: '#ffb433', fontSize: '18px' }}>→</div>
              </a>
            ))}
          </div>

          {/* Right Column: Mail & Amateur Section */}
          <div style={{ flex: '1' }}>
            
            {/* MAIL LOOK */}
            <div style={{ marginBottom: '40px' }}>
               <p style={{ fontWeight: '900', fontSize: '10px', color: '#8a7b7a', marginBottom: '10px', letterSpacing: '2px' }}>RECEIVED MAIL</p>
               <div style={styles.mailLetter}>
                  <p style={{ fontSize: '15px', color: '#4a2c2a', lineHeight: '1.6', margin: 0 }}>
                    "I finally tried painting even though I haven't held a brush since 1998. It looks terrible and I feel fantastic!"
                  </p>
                  <p style={{ marginTop: '20px', fontSize: '13px', fontWeight: 'bold', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                    — S. Kapoor
                  </p>
               </div>
            </div>

            {/* AMATEUR'S CORNER SCRAPBOOK */}
            <div style={styles.amateurScrapbook}>
              <div style={styles.tape}></div>
              <h4 style={{ ...styles.spotlightText, color: '#e86424', fontSize: '11px', letterSpacing: '2px', marginBottom: '15px' }}>AMATEUR'S CORNER</h4>
              <div style={{ fontSize: '32px', textAlign: 'center' }}>🍞</div>
              <p style={{ fontSize: '13px', fontWeight: '900', color: '#4a2c2a', textTransform: 'uppercase', textAlign: 'center', margin: '10px 0' }}>THE BRICK</p>
              <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#6b5e5d', textAlign: 'center' }}>
                "My first sourdough was hard enough to use as a doorstop. Here's to failing with style."
              </p>
              <a href="#submit" className="submit-btn" style={{ display: 'block', marginTop: '20px', padding: '10px', backgroundColor: '#4a2c2a', color: '#fff', fontSize: '10px', fontWeight: '900', textAlign: 'center', textDecoration: 'none', borderRadius: '4px', transition: 'all 0.2s ease' }}>
                SUBMIT YOUR FAILURES
              </a>
            </div>

          </div>
        </div>

        {/* --- FOOTER --- */}
        <div style={styles.footer}>
          <p>© 2024 Maami's Digest. Celebrating the beauty of being an amateur.</p>
          <div style={{ marginTop: '15px' }}>
            <a href="https://sollungomaami.com" className="footer-link" style={styles.footerLink}>Website</a>
            <a href="https://instagram.com/sollungomaami" className="footer-link" style={styles.footerLink}>Instagram</a>
            <a href="#unsubscribe" className="footer-link" style={{ ...styles.footerLink, color: '#e86424' }}>Unsubscribe</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
