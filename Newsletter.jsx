import React from 'react';

const App = () => {
  // Styles based on your React Email configuration
  const styles = {
    main: {
      backgroundColor: "#fefefe",
      fontFamily: 'HelveticaNeue, Helvetica, Arial, sans-serif',
      padding: '40px 0',
      minHeight: '100vh',
    },
    container: {
      margin: "0 auto",
      width: "600px",
      backgroundColor: "#ffffff",
      padding: "20px",
      border: "1px solid #eee",
    },
    headerSection: {
      paddingBottom: '20px',
    },
    mainTitle: {
      fontSize: "48px",
      color: "#e86424",
      margin: "0",
      lineHeight: "1",
      fontWeight: 'bold',
    },
    subTitle: {
      fontSize: "42px",
      color: "#4a2c2a",
      margin: "0",
      lineHeight: "1",
      fontWeight: 'bold',
    },
    socialLinks: {
      fontSize: "12px",
      marginTop: "10px",
      color: "#4a2c2a",
    },
    link: {
      color: "#4a2c2a",
      textDecoration: "underline",
      marginRight: '15px',
    },
    logo: {
      backgroundColor: '#f0f0f0',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#999',
    },
    spotlightHeader: {
      backgroundColor: "#ffb433",
      width: "200px",
      borderRadius: "15px 15px 0 0",
      padding: "8px 20px",
      position: 'relative',
      zIndex: 2,
    },
    spotlightText: {
      fontWeight: "bold",
      color: "#4a2c2a",
      margin: 0,
    },
    orangeCard: {
      backgroundColor: "#e86424",
      borderRadius: "0 15px 15px 15px",
      padding: "20px",
      marginTop: "-2px",
    },
    artCard: {
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      padding: "10px",
      height: '100%',
    },
    artLabel: {
      fontWeight: "bold",
      color: "#4a2c2a",
      marginBottom: "8px",
      display: 'block',
    },
    artContent: {
      fontSize: "11px",
      color: "#666",
      marginTop: '8px',
      lineHeight: '1.4',
    },
    yellowHeader: {
      backgroundColor: "#ffb433",
      padding: "12px 20px",
      borderRadius: "15px",
      marginBottom: '15px',
    },
    sectionTitle: {
      fontWeight: "bold",
      margin: 0,
      color: "#4a2c2a",
    },
    recipeRow: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      alignItems: 'start',
    },
    recipeTitle: {
      fontWeight: "bold",
      fontSize: "18px",
      margin: '0 0 5px 0',
      display: 'flex',
      alignItems: 'center',
    },
    recipeText: {
      fontSize: "12px",
      color: "#444",
      margin: 0,
      lineHeight: '1.5',
    },
    numberCircle: {
      backgroundColor: "#e86424",
      color: "white",
      borderRadius: "50%",
      width: '24px',
      height: '24px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: "8px",
      fontSize: '14px',
    },
    recipeImg: {
      borderRadius: "10px",
      width: '120px',
      height: '90px',
      backgroundColor: '#f0f0f0',
      objectFit: 'cover',
    },
    noteCard: {
      backgroundColor: "#f28c48",
      borderRadius: "15px",
      padding: "15px",
      color: "white",
      marginBottom: '20px',
    },
    noteHeader: {
      fontSize: "16px",
      margin: "0 0 10px 0",
      fontWeight: 'bold',
    },
    noteBody: {
      fontSize: "12px",
      fontStyle: "italic",
      margin: 0,
    },
    noteSign: {
      fontSize: "12px",
      fontWeight: "bold",
      textAlign: "right",
      display: 'block',
      marginTop: '10px',
    },
    suggestionCard: {
      backgroundColor: "#d1dee8",
      borderRadius: "15px",
      padding: "15px",
      textAlign: "center",
    },
    suggestTitle: {
      color: "#222",
      margin: "0 0 10px 0",
      fontSize: '16px',
      fontWeight: 'bold',
    },
    suggestBody: {
      fontSize: "11px",
      color: "#444",
      margin: '10px 0 0 0',
    }
  };

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        {/* --- HEADER --- */}
        <div style={styles.headerSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={styles.mainTitle}>MAAMI'S</h1>
              <h2 style={styles.subTitle}>NEWSLETTER</h2>
              <div style={styles.socialLinks}>
                <a href="#" style={styles.link}>@sollungomaamiofficial</a>
                <a href="#" style={styles.link}>www.sollungomaami.com</a>
              </div>
            </div>
            <div style={styles.logo}>Logo</div>
          </div>
        </div>

        {/* --- SPOTLIGHT SECTION --- */}
        <div style={styles.spotlightHeader}>
          <p style={styles.spotlightText}>SPOTLIGHT</p>
        </div>
        
        <div style={styles.orangeCard}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={styles.artCard}>
                <span style={styles.artLabel}>Art</span>
                <img 
                  src={`https://picsum.photos/seed/${i + 20}/150/80`} 
                  style={{ width: '100%', borderRadius: '5px' }} 
                  alt="Art" 
                />
                <p style={styles.artContent}>
                  {i === 1 ? "Our big topic is life cycles - especially butterflies!" : "Students are exploring fun nonfiction books and key facts."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- POSTS & SIDEBAR --- */}
        <div style={{ display: 'flex', marginTop: '20px', gap: '20px' }}>
          {/* Left Column: Posts */}
          <div style={{ flex: '2' }}>
            <div style={styles.yellowHeader}>
              <p style={styles.sectionTitle}>POSTS THIS MONTH</p>
            </div>

            {/* Recipe 1 */}
            <div style={styles.recipeRow}>
              <div style={{ flex: 1 }}>
                <h3 style={styles.recipeTitle}>
                  <span style={styles.numberCircle}>1</span> Recipe
                </h3>
                <p style={styles.recipeText}>
                  Students are exploring nonfiction books and distinguishing between real and fictional stories.
                </p>
              </div>
              <img src="https://picsum.photos/seed/recipe1/150/100" style={styles.recipeImg} alt="Recipe" />
            </div>

            {/* Recipe 2 (Reversed) */}
            <div style={styles.recipeRow}>
              <img src="https://picsum.photos/seed/recipe2/150/100" style={styles.recipeImg} alt="Recipe" />
              <div style={{ flex: 1 }}>
                <h3 style={styles.recipeTitle}>
                  <span style={styles.numberCircle}>2</span> Recipe
                </h3>
                <p style={styles.recipeText}>
                  Hands-on experiments to explore the properties of liquids and solids.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Notes & Suggestions */}
          <div style={{ flex: '1' }}>
            <div style={styles.noteCard}>
              <h3 style={styles.noteHeader}>📝 Note from viewer</h3>
              <p style={styles.noteBody}>
                "Thank you for another amazing month! Can't wait for the Summer Reading Challenge!"
              </p>
              <span style={styles.noteSign}>- Viewer Name</span>
            </div>

            <div style={styles.suggestionCard}>
              <h4 style={styles.suggestTitle}>Suggestions Welcome</h4>
              <div style={{ fontSize: '30px' }}>💡</div>
              <p style={styles.suggestBody}>
                Claudia is kind and helpful, enjoys Reading and Music!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
