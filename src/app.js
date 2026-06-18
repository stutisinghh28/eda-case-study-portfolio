// Data-Focused App Logic for EDA Portfolio

document.addEventListener('DOMContentLoaded', () => {
    // Current State
    let activeCase = 'netflix';
    let activeSection = 'overview';
    let rawDataset = [];
    let filteredDataset = [];
    let currentPage = 1;
    let pageSize = 25;
    let portfolioMetrics = {};

    // Case Study Definitions (Data & Metadata)
    const cases = {
        netflix: {
            title: "Netflix Content Strategy & Streaming Trends",
            csvName: "netflix_cleaned.csv",
            size: "8,807 rows x 11 columns",
            variables: "show_id, type, title, director, cast, country, date_added, release_year, rating, duration, listed_in",
            tools: ["Python", "Pandas", "Matplotlib", "Seaborn"],
            overviewText: "This case study examines the Netflix movie and TV show catalog. The analysis cleans raw text strings, standardizes date fields, corrects column alignment errors, and extracts features such as co-producing countries and primary genres. The findings show a clear strategy: high-volume movie acquisition combined with short-lived TV shows to drive user retention, with a strong focus on mature audiences (TV-MA) and international licensing.",
            charts: [
                { id: "ratio", name: "Movies vs TV Shows Ratio", file: "chart_1_ratio.png", desc: "Donut chart showing catalog breakdown. Movies comprise 69.6% (6,131 titles) compared to 30.4% (2,676 titles) for TV Shows." },
                { id: "added", name: "Content Added Over Time (2008-2021)", file: "chart_2_added.png", desc: "Area chart showing exponential additions post-2015, capturing Netflix's rapid global expansion." },
                { id: "countries", name: "Top 10 Producing Countries", file: "chart_3_countries.png", desc: "Horizontal bar chart showing the United States as the dominant producer, followed by India (heavily movie-centric) and the UK." },
                { id: "ratings", name: "Content Rating Classifications", file: "chart_4_ratings.png", desc: "Bar chart showing rating categories. TV-MA and TV-14 combine to represent ~75% of the catalog, demonstrating a focus on mature audiences." }
            ],
            insights: [
                { title: "Movie Dominance", text: "Movies represent nearly 70% of the titles. They offer quick, one-off content consumption which maintains daily active usage." },
                { title: "Exponential Addition Trend", text: "A massive surge in content additions is visible starting in 2016. This aligns with Netflix's expansion into 130 new countries in early 2016, requiring immediate library scaling." },
                { title: "Mature Audience Target", text: "Over 40% of the entire Netflix catalog is rated TV-MA. This indicates Netflix deliberately targets teens and adults, avoiding direct competition with family-focused services like Disney+." },
                { title: "International Globalization", text: "Drama and International Movies are the top genre tags. They are highly translatable across borders, allowing local hits (e.g. Squid Game, Money Heist) to drive global growth." }
            ]
        },
        churn: {
            title: "Telecom Customer Churn & Attrition Drivers",
            csvName: "churn_cleaned.csv",
            size: "7,043 rows x 15 columns",
            variables: "customerID, gender, SeniorCitizen, Partner, Dependents, tenure, PhoneService, MultipleLines, InternetService, Contract, PaperlessBilling, PaymentMethod, MonthlyCharges, TotalCharges, Churn",
            tools: ["Python", "NumPy", "Pandas", "Matplotlib", "Seaborn"],
            overviewText: "An exploratory analysis of a telecom subscriber base containing 7,043 customer records. We clean and convert charges to numerical variables, impute missing total charges, and compute statistical profiles. The study analyzes the statistical correlation between customer contract commitments, monthly billing charges, customer tenure, and churn rates to recommend strategic pricing modifications.",
            charts: [
                { id: "ratio", name: "Overall Churn Distribution", file: "chart_1_ratio.png", desc: "Bar chart showing customer status. Out of 7,043 customers, 26.5% (1,869 customers) churned, representing a significant revenue leakage." },
                { id: "contract", name: "Churn Rate by Contract Type", file: "chart_2_contract_churn.png", desc: "Stacked bar chart showing contract impact. Month-to-month contracts exhibit an alarming 42.7% churn rate, compared to single digits for 1-year (11.3%) and 2-year (2.8%) contracts." },
                { id: "charges", name: "Monthly Charges Distribution", file: "chart_3_charges_box.png", desc: "Box plot illustrating monthly bills. Customers who churned show a much higher median monthly charge (~$79) compared to active customers (~$64), indicating pricing sensitivity." },
                { id: "tenure", name: "Tenure Distribution vs Churn", file: "chart_4_tenure_dist.png", desc: "Histogram showing customer tenure. Churn is heavily concentrated in the first 1-6 months, highlighting critical onboarding attrition." }
            ],
            insights: [
                { title: "Tenure Attrition Hook", text: "Customer churn is heavily front-loaded. A major spike occurs in months 1 to 5, meaning early customer success, onboarding, and first-month experiences are the primary drivers of retention." },
                { title: "Contract Stability", text: "Month-to-month contracts show a 42.7% churn rate. Migrating users from short-term monthly plans to longer-term annual contracts is statistically the most effective mitigation strategy." },
                { title: "Price Elasticity Threshold", text: "Churned customers paid a significantly higher median monthly rate ($79.6) than retained ones ($64.4). Subscribers on expensive fiber-optic plans without bundles are highly prone to attrition." },
                { title: "NumPy Summary Metrics", text: "The average customer tenure is 32.4 months. Active customers have an average monthly bill of $61.27, whereas churned customers averaged a higher monthly charge of $74.44." }
            ]
        },
        spotify: {
            title: "Spotify Acoustic Features & Popularity Correlation",
            csvName: "spotify_cleaned.csv",
            size: "953 rows x 16 columns",
            variables: "track_name, artist(s)_name, artist_count, released_year, released_month, bpm, key, mode, danceability_%, valence_%, energy_%, acousticness_%",
            tools: ["Python", "Pandas", "Matplotlib", "Seaborn"],
            overviewText: "This case study explores audio characteristics of 953 top-streamed songs on Spotify. We validate data types, handle special encoding characters, and isolate acoustic variables. We perform bivariate correlations between variables like tempo (BPM), danceability, valence (musical positiveness), energy, and overall play streams to identify what sonic profiles constitute a commercial hit.",
            charts: [
                { id: "popularity", name: "Top 10 Most Streamed Tracks", file: "chart_1_popularity.png", desc: "Horizontal bar chart of streams. Shows record-breakers led by Blinding Lights (The Weeknd) exceeding 3.5 billion streams." },
                { id: "correlation", name: "Audio Features Correlation Matrix", file: "chart_2_correlation.png", desc: "Heatmap demonstrating correlation. Reveals that acousticness is strongly negatively correlated with energy (-0.58). Streams show very low linear correlation with specific individual audio features, indicating that popularity depends on complex combinations rather than single acoustic attributes." },
                { id: "scatter", name: "Acousticness vs Energy Bivariate Plot", file: "chart_3_acoustic_energy.png", desc: "Scatter plot plotting acousticness against energy. Shows a dense cluster: hit tracks are overwhelmingly high-energy, low-acousticness tracks." },
                { id: "bpm", name: "Tempo (BPM) Density Distribution", file: "chart_4_bpm_dist.png", desc: "Histogram showing song tempo. Peak BPM is concentrated between 110 and 130 BPM, which matches the standard tempo ranges for pop, dance, and house music." }
            ],
            insights: [
                { title: "Sonics of a Hit Track", text: "Hit songs on Spotify skew heavily toward high energy (mean 64.2%) and high danceability (mean 66.9%). Low-energy, highly acoustic tracks are statistically less likely to reach the top streaming charts." },
                { title: "Acoustic-Energy Negative Correlation", text: "We find a strong negative correlation coefficient (-0.58) between energy and acousticness. As instruments become more acoustic and less processed, electronic energy levels decline significantly." },
                { title: "Tempo Sweet Spot", text: "Tempo distribution shows a primary mode around 120-125 BPM. This tempo aligns with human walking/running rhythms and club dance beats, making it highly engaging for listeners." },
                { title: "Complexity of Popularity", text: "The correlation between streams and any single audio attribute (like BPM or valence) is near zero. This proves popularity is multi-dimensional, driven by marketing, social media trends (e.g. TikTok), and artist notoriety, rather than a simple acoustic formula." }
            ]
        },
        superstore: {
            title: "Superstore Transactional Sales & Profitability",
            csvName: "superstore_cleaned.csv",
            size: "9,994 rows x 15 columns",
            variables: "Order ID, Order Date, Ship Mode, Segment, Region, Country, State, City, Category, Sub-Category, Product Name, Sales, Quantity, Discount, Profit",
            tools: ["Python", "Pandas", "Matplotlib", "Seaborn"],
            overviewText: "An EDA of 9,994 retail sales transactions. We clean transactional amounts, calculate regional profit margins, and construct date indexes. The analysis evaluates product profitability across sub-categories and regions, identifying key customer segments that generate high margins versus categories operating at a loss (due to aggressive discounting).",
            charts: [
                { id: "sales", name: "Sales Volume by Category", file: "chart_1_sales_cat.png", desc: "Bar chart showing sales. Technology and Furniture lead with similar sales volumes (~$830k each), while Office Supplies has the lowest volume (~$719k)." },
                { id: "profit", name: "Profit Contribution by Segment & Region", file: "chart_2_profit_segment.png", desc: "Clustered bar chart of profits. The Consumer segment in the East and West regions generates the highest total profits, while the Central region is consistently low across all segments." },
                { id: "subcat", name: "Sub-Category Profitability Analysis", file: "chart_3_subcat_profit.png", desc: "Horizontal bar chart separating profitable and unprofitable lines. Copiers and Phones are highly lucrative, while Tables, Bookcases, and Supplies are operating at a net loss." },
                { id: "time", name: "Monthly Sales Revenue Trends", file: "chart_4_sales_time.png", desc: "Line chart showing seasonality. Revenue shows a distinct cyclical pattern, peaking every Q4 (November/December holiday rush) and dropping every Q1." }
            ],
            insights: [
                { title: "Loss-Leader Sub-Categories", text: "Tables are the largest source of profit leakage, generating a net loss of over -$17,000. Bookcases and Supplies also operate at a loss, driven by excessive discounts." },
                { title: "Technology Margin Engine", text: "Copiers generate the highest profit margin, returning over $55,000 in net profit despite having a much lower sales volume than furniture. This represents a high-margin opportunity." },
                { title: "Holiday Seasonality", text: "Sales trend charts confirm a recurring seasonal pattern: sales spike in Q4 (driven by Black Friday and Christmas commercial cycles) and slump in Q1, necessitating inventory and staffing alignment." },
                { title: "Profit Margin Profile", text: "The store generated $2,297,200.86 in total sales and $286,397.02 in profit, yielding a net corporate profit margin of 12.47%." }
            ]
        }
    };

    // ==========================================
    // UI ELEMENTS
    // ==========================================
    const sidebarButtons = document.querySelectorAll('.nav-case-btn');
    const caseTitle = document.getElementById('active-case-title');
    const caseBadge = document.getElementById('active-case-badge');
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    const sectionPanes = document.querySelectorAll('.section-pane');

    // Overview Tab fields
    const overviewParagraph = document.getElementById('overview-paragraph');
    const overviewToolsRow = document.getElementById('overview-tools-row');
    const overviewDatasetSize = document.getElementById('overview-dataset-size');
    const overviewVariables = document.getElementById('overview-variables');

    // Visualizations Tab fields
    const chartSelectorsContainer = document.getElementById('chart-selectors-container');
    const galleryChartTitle = document.getElementById('gallery-chart-title');
    const galleryChartImage = document.getElementById('gallery-chart-image');
    const galleryChartInterpretation = document.getElementById('gallery-chart-interpretation');

    // Data Explorer Tab fields
    const searchInput = document.getElementById('search-input');
    const tableHeadRow = document.getElementById('table-head-row');
    const tableBodyRows = document.getElementById('table-body-rows');
    const tblFilteredCount = document.getElementById('tbl-filtered-count');
    const tblTotalCount = document.getElementById('tbl-total-count');
    const tblPageSizeSelect = document.getElementById('tbl-page-size');
    const tblPrevBtn = document.getElementById('tbl-prev');
    const tblNextBtn = document.getElementById('tbl-next');
    const tblPageNumbers = document.getElementById('tbl-page-numbers');
    const filterField1 = document.getElementById('dynamic-filter-field-1');
    const filterField2 = document.getElementById('dynamic-filter-field-2');
    const btnResetExplorer = document.getElementById('btn-reset-explorer');

    // Insights Tab fields
    const insightsAccordionList = document.getElementById('insights-accordion-list');

    // Modal
    const recordModal = document.getElementById('record-detail-modal');
    const modalCloseIcon = document.querySelector('.modal-close-icon');
    const modalHeaderTag = document.getElementById('modal-header-tag');
    const modalHeaderTitle = document.getElementById('modal-header-title');
    const modalKeyValueContainer = document.getElementById('modal-key-value-container');

    // ==========================================
    // NAVIGATION & PORTFOLIO LOGIC
    // ==========================================
    
    // Switch between the 4 Case Studies
    sidebarButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const caseId = btn.getAttribute('data-case');
            if (activeCase === caseId) return;
            
            activeCase = caseId;
            sidebarButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Set active body theme
            document.body.setAttribute('data-active-theme', caseId);
            
            // Update Case Meta Header
            caseBadge.textContent = `CASE STUDY: ${caseId.toUpperCase()}`;
            caseTitle.textContent = cases[caseId].title;
            
            // Reload active tab viewport
            loadCaseData();
        });
    });

    // Switch between Sub-Tabs (Overview, Visualizations, Explorer, Insights)
    subTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section');
            if (activeSection === sectionId) return;

            activeSection = sectionId;
            subTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            sectionPanes.forEach(pane => {
                if (pane.id === `section-${sectionId}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });

    // ==========================================
    // DATA LOADING & CALCULATION ENGINE
    // ==========================================
    
    // CSV Parser
    function parseCSV(text) {
        let lines = [];
        let row = [""];
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            let c = text[i];
            let next = text[i+1];
            if (c === '"') {
                if (inQuotes && next === '"') {
                    row[row.length - 1] += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c === ',' && !inQuotes) {
                row.push("");
            } else if ((c === '\r' || c === '\n') && !inQuotes) {
                if (c === '\r' && next === '\n') {
                    i++;
                }
                lines.push(row);
                row = [""];
            } else {
                row[row.length - 1] += c;
            }
        }
        if (row.length > 1 || row[0] !== "") {
            lines.push(row);
        }
        
        let headers = lines[0].map(h => h.trim());
        let data = [];
        for (let i = 1; i < lines.length; i++) {
            let values = lines[i];
            if (values.length < headers.length) continue;
            let obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = values[j] ? values[j].trim() : "";
            }
            data.push(obj);
        }
        return data;
    }

    // Load active Case Study data
    async function loadCaseData() {
        const caseMeta = cases[activeCase];
        
        // 1. Overview Pane Populate
        overviewParagraph.textContent = caseMeta.overviewText;
        overviewDatasetSize.textContent = caseMeta.size;
        overviewVariables.textContent = caseMeta.variables;
        
        overviewToolsRow.innerHTML = '';
        caseMeta.tools.forEach(tool => {
            overviewToolsRow.innerHTML += `<span class="tool-pill">${tool}</span>`;
        });

        // 2. KPI Cards Populate
        updateKPICards();

        // 3. Visualizations Gallery Populate
        setupGallery();

        // 4. Insights Pane Populate
        setupInsights();

        // 5. Load CSV Dataset for Data Explorer
        loadCSVDataset(caseMeta.csvName);
    }

    // Update KPI Card UI values dynamically
    function updateKPICards() {
        const kpi1 = document.getElementById('kpi-card-1');
        const kpi2 = document.getElementById('kpi-card-2');
        const kpi3 = document.getElementById('kpi-card-3');
        const kpi4 = document.getElementById('kpi-card-4');
        
        const label1 = document.getElementById('kpi-label-1');
        const label2 = document.getElementById('kpi-label-2');
        const label3 = document.getElementById('kpi-label-3');
        const label4 = document.getElementById('kpi-label-4');
        
        const val1 = document.getElementById('kpi-val-1');
        const val2 = document.getElementById('kpi-val-2');
        const val3 = document.getElementById('kpi-val-3');
        const val4 = document.getElementById('kpi-val-4');
        
        const desc1 = document.getElementById('kpi-desc-1');
        const desc2 = document.getElementById('kpi-desc-2');
        const desc3 = document.getElementById('kpi-desc-3');
        const desc4 = document.getElementById('kpi-desc-4');
        
        const icon1 = document.getElementById('kpi-icon-1');
        const icon2 = document.getElementById('kpi-icon-2');
        const icon3 = document.getElementById('kpi-icon-3');
        const icon4 = document.getElementById('kpi-icon-4');

        const metrics = portfolioMetrics[activeCase];

        if (activeCase === 'netflix') {
            label1.textContent = "Total Titles";
            val1.textContent = metrics?.total_titles?.toLocaleString() || "8,807";
            desc1.textContent = "Movies & TV Shows";
            icon1.textContent = "🎬";

            label2.textContent = "Movies Ratio";
            val2.textContent = `${metrics?.movies_pct || "69.6"}%`;
            desc2.textContent = `${metrics?.total_movies?.toLocaleString() || "6,131"} movies`;
            icon2.textContent = "🎥";

            label3.textContent = "TV Shows Ratio";
            val3.textContent = `${metrics?.tv_pct || "30.4"}%`;
            desc3.textContent = `${metrics?.total_tv_shows?.toLocaleString() || "2,676"} shows`;
            icon3.textContent = "📺";

            label4.textContent = "Top Producer";
            val4.textContent = metrics?.top_country || "United States";
            desc4.textContent = "Highest catalog share";
            icon4.textContent = "🌍";
        } 
        else if (activeCase === 'churn') {
            label1.textContent = "Total Records";
            val1.textContent = metrics?.total_records?.toLocaleString() || "7,043";
            desc1.textContent = "Telecom Customers";
            icon1.textContent = "👥";

            label2.textContent = "Churn Rate";
            val2.textContent = `${metrics?.churn_rate || "26.5"}%`;
            desc2.textContent = "Customer attrition";
            icon2.textContent = "📉";

            label3.textContent = "Mean Tenure";
            val3.textContent = `${metrics?.mean_tenure_months || "32.4"} mo`;
            desc3.textContent = "Customer lifetime value";
            icon3.textContent = "⏳";

            label4.textContent = "Churn Bill Avg";
            val4.textContent = `$${metrics?.churned_mean_charges || "74.44"}`;
            desc4.textContent = "Retained paid avg: $61.27";
            icon4.textContent = "💵";
        } 
        else if (activeCase === 'spotify') {
            label1.textContent = "Total Hits";
            val1.textContent = metrics?.total_tracks?.toLocaleString() || "953";
            desc1.textContent = "Tracks (2023)";
            icon1.textContent = "🎵";

            label2.textContent = "Top Track";
            val2.textContent = metrics?.top_track ? (metrics.top_track.length > 15 ? metrics.top_track.slice(0,15)+'...' : metrics.top_track) : "Blinding Lights";
            desc2.textContent = metrics?.top_artist || "The Weeknd";
            icon2.textContent = "🏆";

            label3.textContent = "Mean Danceability";
            val3.textContent = `${metrics?.mean_danceability_pct || "66.9"}%`;
            desc3.textContent = "Hit song sonics profile";
            icon3.textContent = "🕺";

            label4.textContent = "Mean Energy";
            val4.textContent = `${metrics?.mean_energy_pct || "64.2"}%`;
            desc4.textContent = "High energy concentration";
            icon4.textContent = "🔥";
        } 
        else if (activeCase === 'superstore') {
            label1.textContent = "Transactions";
            val1.textContent = metrics?.total_transactions?.toLocaleString() || "9,994";
            desc1.textContent = "Customer invoices";
            icon1.textContent = "🧾";

            label2.textContent = "Total Sales";
            val2.textContent = `$${Math.round(metrics?.total_sales || 2297200).toLocaleString()}`;
            desc2.textContent = "Gross store revenue";
            icon2.textContent = "💰";

            label3.textContent = "Total Profit";
            val3.textContent = `$${Math.round(metrics?.total_profit || 286397).toLocaleString()}`;
            desc3.textContent = "Net earnings";
            icon3.textContent = "📈";

            label4.textContent = "Profit Margin";
            val4.textContent = `${metrics?.profit_margin_pct || "12.47"}%`;
            desc4.textContent = `Top Category: ${metrics?.top_category || "Technology"}`;
            icon4.textContent = "💼";
        }
    }

    // ==========================================
    // VISUALIZATIONS GALLERY LOGIC
    // ==========================================
    function setupGallery() {
        const caseMeta = cases[activeCase];
        chartSelectorsContainer.innerHTML = '';

        // Generate sidebar selector buttons
        caseMeta.charts.forEach((chart, index) => {
            const btn = document.createElement('button');
            btn.className = `chart-tab-btn ${index === 0 ? 'active' : ''}`;
            btn.textContent = `📊 ${chart.name}`;
            btn.dataset.chartId = chart.id;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                displayChart(chart);
            });

            chartSelectorsContainer.appendChild(btn);
        });

        // Load first chart by default
        displayChart(caseMeta.charts[0]);
    }

    function displayChart(chart) {
        galleryChartTitle.textContent = chart.name;
        // The charts are located in output/case_study_X/filename.png
        const csFolder = activeCase === 'netflix' ? 'case_study_1' : 
                         activeCase === 'churn' ? 'case_study_2' : 
                         activeCase === 'spotify' ? 'case_study_3' : 'case_study_4';
        
        galleryChartImage.src = `../output/${csFolder}/${chart.file}`;
        galleryChartInterpretation.textContent = chart.desc;
    }

    // ==========================================
    // INSIGHTS ACCORDION LOGIC
    // ==========================================
    function setupInsights() {
        const caseMeta = cases[activeCase];
        insightsAccordionList.innerHTML = '';

        caseMeta.insights.forEach((insight, index) => {
            const item = document.createElement('div');
            item.className = `acc-item ${index === 0 ? 'active' : ''}`;

            const header = document.createElement('div');
            header.className = 'acc-header';
            header.innerHTML = `
                <h4>💡 ${insight.title}</h4>
                <span class="chevron-icon">▼</span>
            `;

            const body = document.createElement('div');
            body.className = 'acc-body';
            body.style.display = index === 0 ? 'block' : 'none';
            body.innerHTML = `<p>${insight.text}</p>`;

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all
                document.querySelectorAll('.acc-item').forEach(accItem => {
                    accItem.classList.remove('active');
                    accItem.querySelector('.acc-body').style.display = 'none';
                });

                // Toggle clicked
                if (!isActive) {
                    item.classList.add('active');
                    body.style.display = 'block';
                }
            });

            item.appendChild(header);
            item.appendChild(body);
            insightsAccordionList.appendChild(item);
        });
    }

    // ==========================================
    // DATA EXPLORER & TABLES LOGIC (DATA INTENSIVE)
    // ==========================================
    
    // Set headers and structure dynamically
    const tableColumnsConfig = {
        netflix: [
            { id: 'type', label: 'Type' },
            { id: 'title', label: 'Title' },
            { id: 'director', label: 'Director' },
            { id: 'country', label: 'Country' },
            { id: 'release_year', label: 'Release Year' },
            { id: 'rating', label: 'Rating' },
            { id: 'duration', label: 'Duration' },
            { id: 'listed_in', label: 'Genres' }
        ],
        churn: [
            { id: 'customerID', label: 'Customer ID' },
            { id: 'gender', label: 'Gender' },
            { id: 'tenure', label: 'Tenure (Months)' },
            { id: 'Contract', label: 'Contract Type' },
            { id: 'InternetService', label: 'Internet Service' },
            { id: 'MonthlyCharges', label: 'Monthly Bill ($)' },
            { id: 'TotalCharges', label: 'Total Paid ($)' },
            { id: 'Churn', label: 'Churn Status' }
        ],
        spotify: [
            { id: 'track_name', label: 'Track Title' },
            { id: 'artist(s)_name', label: 'Artist(s)' },
            { id: 'released_year', label: 'Year' },
            { id: 'streams', label: 'Total Streams' },
            { id: 'bpm', label: 'BPM' },
            { id: 'danceability_%', label: 'Danceability %' },
            { id: 'energy_%', label: 'Energy %' },
            { id: 'acousticness_%', label: 'Acousticness %' }
        ],
        superstore: [
            { id: 'Order ID', label: 'Order ID' },
            { id: 'Order Date', label: 'Date' },
            { id: 'Segment', label: 'Segment' },
            { id: 'Region', label: 'Region' },
            { id: 'Category', label: 'Category' },
            { id: 'Sub-Category', label: 'Sub-Category' },
            { id: 'Sales', label: 'Sales ($)' },
            { id: 'Profit', label: 'Profit ($)' }
        ]
    };

    // Load CSV file
    async function loadCSVDataset(filename) {
        // Show loading state
        tableBodyRows.innerHTML = `<tr><td colspan="10" class="loading-td">Loading CSV records...</td></tr>`;
        
        try {
            const response = await fetch(`../data/processed/${filename}`);
            if (response.ok) {
                const text = await response.text();
                rawDataset = parseCSV(text);
                filteredDataset = [...rawDataset];

                // Configure Headers
                renderTableHeaders();
                setupExplorerFilters();
                
                // Show Counts
                tblTotalCount.textContent = rawDataset.length.toLocaleString();
                tblFilteredCount.textContent = filteredDataset.length.toLocaleString();

                currentPage = 1;
                renderTableBody();
            } else {
                tableBodyRows.innerHTML = `<tr><td colspan="10" class="loading-td" style="color: var(--netflix-red)">Error loading database file. Run Python analysis script first.</td></tr>`;
            }
        } catch (err) {
            console.error(err);
            tableBodyRows.innerHTML = `<tr><td colspan="10" class="loading-td" style="color: var(--netflix-red)">Error: ${err.message}</td></tr>`;
        }
    }

    // Render columns headers dynamically
    function renderTableHeaders() {
        const columns = tableColumnsConfig[activeCase];
        tableHeadRow.innerHTML = '';
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.label;
            tableHeadRow.appendChild(th);
        });
    }

    // Create case-specific filters
    function setupExplorerFilters() {
        filterField1.innerHTML = '';
        filterField2.innerHTML = '';

        if (activeCase === 'netflix') {
            // Filter 1: Type
            filterField1.innerHTML = `
                <label for="f-netflix-type">Content Type</label>
                <select id="f-netflix-type" class="exp-filter">
                    <option value="all">All Types</option>
                    <option value="Movie">Movie</option>
                    <option value="TV Show">TV Show</option>
                </select>
            `;
            // Filter 2: Rating
            const ratings = Array.from(new Set(rawDataset.map(d => d.rating))).filter(Boolean).sort();
            let selectHTML = `<label for="f-netflix-rating">Rating</label>
                              <select id="f-netflix-rating" class="exp-filter">
                              <option value="all">All Ratings</option>`;
            ratings.forEach(r => selectHTML += `<option value="${r}">${r}</option>`);
            selectHTML += `</select>`;
            filterField2.innerHTML = selectHTML;
        } 
        else if (activeCase === 'churn') {
            // Filter 1: Contract
            filterField1.innerHTML = `
                <label for="f-churn-contract">Contract Type</label>
                <select id="f-churn-contract" class="exp-filter">
                    <option value="all">All Contracts</option>
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                </select>
            `;
            // Filter 2: Churn
            filterField2.innerHTML = `
                <label for="f-churn-status">Churn Status</label>
                <select id="f-churn-status" class="exp-filter">
                    <option value="all">All Statuses</option>
                    <option value="Yes">Churned (Yes)</option>
                    <option value="No">Retained (No)</option>
                </select>
            `;
        } 
        else if (activeCase === 'spotify') {
            // Filter 1: Release Year
            const years = Array.from(new Set(rawDataset.map(d => d.released_year))).filter(Boolean).sort((a,b)=>b-a);
            let selectHTML = `<label for="f-spotify-year">Release Year</label>
                              <select id="f-spotify-year" class="exp-filter">
                              <option value="all">All Years</option>`;
            years.forEach(y => selectHTML += `<option value="${y}">${y}</option>`);
            selectHTML += `</select>`;
            filterField1.innerHTML = selectHTML;

            // Filter 2: Musical Mode
            filterField2.innerHTML = `
                <label for="f-spotify-mode">Musical Mode</label>
                <select id="f-spotify-mode" class="exp-filter">
                    <option value="all">All Modes</option>
                    <option value="Major">Major</option>
                    <option value="Minor">Minor</option>
                </select>
            `;
        } 
        else if (activeCase === 'superstore') {
            // Filter 1: Product Category
            filterField1.innerHTML = `
                <label for="f-store-cat">Category</label>
                <select id="f-store-cat" class="exp-filter">
                    <option value="all">All Categories</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Technology">Technology</option>
                </select>
            `;
            // Filter 2: Region
            filterField2.innerHTML = `
                <label for="f-store-region">Region</label>
                <select id="f-store-region" class="exp-filter">
                    <option value="all">All Regions</option>
                    <option value="Central">Central</option>
                    <option value="East">East</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                </select>
            `;
        }

        // Re-attach event listeners to select elements
        document.querySelectorAll('.exp-filter').forEach(select => {
            select.addEventListener('change', applyFilters);
        });
    }

    // Filter Logic
    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();
        
        filteredDataset = rawDataset.filter(item => {
            // 1. Text Search across all properties
            let matchesSearch = true;
            if (query) {
                matchesSearch = Object.values(item).some(val => 
                    val.toString().toLowerCase().includes(query)
                );
            }

            // 2. Case specific Filters
            let matchesF1 = true;
            let matchesF2 = true;

            if (activeCase === 'netflix') {
                const typeEl = document.getElementById('f-netflix-type');
                const ratingEl = document.getElementById('f-netflix-rating');
                if (typeEl && typeEl.value !== 'all') matchesF1 = (item.type === typeEl.value);
                if (ratingEl && ratingEl.value !== 'all') matchesF2 = (item.rating === ratingEl.value);
            } 
            else if (activeCase === 'churn') {
                const contractEl = document.getElementById('f-churn-contract');
                const statusEl = document.getElementById('f-churn-status');
                if (contractEl && contractEl.value !== 'all') matchesF1 = (item.Contract === contractEl.value);
                if (statusEl && statusEl.value !== 'all') matchesF2 = (item.Churn === statusEl.value);
            } 
            else if (activeCase === 'spotify') {
                const yearEl = document.getElementById('f-spotify-year');
                const modeEl = document.getElementById('f-spotify-mode');
                if (yearEl && yearEl.value !== 'all') matchesF1 = (item.released_year === yearEl.value);
                if (modeEl && modeEl.value !== 'all') matchesF2 = (item.mode === modeEl.value);
            } 
            else if (activeCase === 'superstore') {
                const catEl = document.getElementById('f-store-cat');
                const regionEl = document.getElementById('f-store-region');
                if (catEl && catEl.value !== 'all') matchesF1 = (item.Category === catEl.value);
                if (regionEl && regionEl.value !== 'all') matchesF2 = (item.Region === regionEl.value);
            }

            return matchesSearch && matchesF1 && matchesF2;
        });

        currentPage = 1;
        tblFilteredCount.textContent = filteredDataset.length.toLocaleString();
        renderTableBody();
    }

    // Render table rows based on current page
    function renderTableBody() {
        tableBodyRows.innerHTML = '';
        const columns = tableColumnsConfig[activeCase];

        if (filteredDataset.length === 0) {
            tableBodyRows.innerHTML = `<tr><td colspan="${columns.length}" class="loading-td">No records found matching filters.</td></tr>`;
            tblPrevBtn.disabled = true;
            tblNextBtn.disabled = true;
            tblPageNumbers.innerHTML = '';
            return;
        }

        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = Math.min(startIdx + pageSize, filteredDataset.length);
        const pageData = filteredDataset.slice(startIdx, endIdx);

        pageData.forEach(row => {
            const tr = document.createElement('tr');
            
            // Generate TDs in matching config order
            columns.forEach(col => {
                const td = document.createElement('td');
                const cellVal = row[col.id] || '';
                td.textContent = cellVal;
                td.title = cellVal;
                tr.appendChild(td);
            });

            // Row click details modal trigger
            tr.addEventListener('click', () => {
                showDetailModal(row);
            });

            tableBodyRows.appendChild(tr);
        });

        // Update Pagination controls
        const totalPages = Math.ceil(filteredDataset.length / pageSize);
        tblPrevBtn.disabled = currentPage === 1;
        tblNextBtn.disabled = currentPage === totalPages;

        renderPageNumbers(totalPages);
    }

    function renderPageNumbers(totalPages) {
        tblPageNumbers.innerHTML = '';
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            addPageBtn(1);
            if (start > 2) {
                const dots = document.createElement('span');
                dots.className = 'p-num dots';
                dots.textContent = '...';
                tblPageNumbers.appendChild(dots);
            }
        }

        for (let i = start; i <= end; i++) {
            addPageBtn(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) {
                const dots = document.createElement('span');
                dots.className = 'p-num dots';
                dots.textContent = '...';
                tblPageNumbers.appendChild(dots);
            }
            addPageBtn(totalPages);
        }
    }

    function addPageBtn(num) {
        const btn = document.createElement('button');
        btn.className = `p-num ${num === currentPage ? 'active' : ''}`;
        btn.textContent = num;
        btn.addEventListener('click', () => {
            currentPage = num;
            renderTableBody();
        });
        tblPageNumbers.appendChild(btn);
    }

    // Pagination Listeners
    tblPrevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTableBody();
        }
    });

    tblNextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredDataset.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTableBody();
        }
    });

    tblPageSizeSelect.addEventListener('change', () => {
        pageSize = parseInt(tblPageSizeSelect.value);
        currentPage = 1;
        renderTableBody();
    });

    // Reset filters
    btnResetExplorer.addEventListener('click', () => {
        searchInput.value = '';
        document.querySelectorAll('.exp-filter').forEach(select => {
            select.value = 'all';
        });
        applyFilters();
    });

    searchInput.addEventListener('input', debounce(applyFilters, 200));

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // ==========================================
    // DETAILS MODAL LOGIC
    // ==========================================
    function showDetailModal(row) {
        modalHeaderTag.textContent = `${activeCase.toUpperCase()} RECORD DETAILS`;
        
        // Define title fields for modal header
        let titleVal = '';
        if (activeCase === 'netflix') titleVal = row.title;
        else if (activeCase === 'churn') titleVal = `Customer ${row.customerID}`;
        else if (activeCase === 'spotify') titleVal = `${row.track_name} by ${row['artist(s)_name']}`;
        else if (activeCase === 'superstore') titleVal = `${row['Product Name'] || 'Item'} (Order: ${row['Order ID']})`;

        modalHeaderTitle.textContent = titleVal;

        // Render all key-values dynamically
        modalKeyValueContainer.innerHTML = '';
        Object.entries(row).forEach(([key, val]) => {
            const div = document.createElement('div');
            div.className = 'detail-row';
            div.innerHTML = `
                <span class="detail-row-lbl">${key.replace(/_/g, ' ')}</span>
                <span class="detail-row-val">${val || 'Not Specified'}</span>
            `;
            modalKeyValueContainer.appendChild(div);
        });

        recordModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        recordModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    modalCloseIcon.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === recordModal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && recordModal.classList.contains('open')) closeModal();
    });

    // ==========================================
    // INITIALIZATION ENGINE
    // ==========================================
    async function initializePortfolio() {
        try {
            // Load portfolio statistics JSON
            const response = await fetch('../data/processed/portfolio_metrics.json');
            if (response.ok) {
                portfolioMetrics = await response.json();
            }
            
            // Set body theme
            document.body.setAttribute('data-active-theme', activeCase);

            // Load default case
            loadCaseData();
        } catch (err) {
            console.error("Failed to load portfolio metrics:", err);
            // Load anyway with fallbacks
            document.body.setAttribute('data-active-theme', activeCase);
            loadCaseData();
        }
    }

    initializePortfolio();
});
