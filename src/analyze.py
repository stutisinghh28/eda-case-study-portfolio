import os
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import requests

# Configure Paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SRC_DIR)
DATA_RAW_DIR = os.path.join(PROJECT_ROOT, 'data', 'raw')
DATA_PROCESSED_DIR = os.path.join(PROJECT_ROOT, 'data', 'processed')

os.makedirs(DATA_RAW_DIR, exist_ok=True)
os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)

# Define output folders for each case study
CS1_DIR = os.path.join(PROJECT_ROOT, 'output', 'case_study_1')
CS2_DIR = os.path.join(PROJECT_ROOT, 'output', 'case_study_2')
CS3_DIR = os.path.join(PROJECT_ROOT, 'output', 'case_study_3')
CS4_DIR = os.path.join(PROJECT_ROOT, 'output', 'case_study_4')

for d in [CS1_DIR, CS2_DIR, CS3_DIR, CS4_DIR]:
    os.makedirs(d, exist_ok=True)

# Datasets URLs
URLS = {
    "netflix": "https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2021/2021-04-20/netflix_titles.csv",
    "churn": "https://raw.githubusercontent.com/alexeygrigorev/mlbookcamp-code/master/chapter-03-churn-prediction/WA_Fn-UseC_-Telco-Customer-Churn.csv",
    "spotify": "https://raw.githubusercontent.com/zero-to-mastery/file-io/main/spotify-2023.csv",
    "superstore": "https://raw.githubusercontent.com/leonism/sample-superstore/master/data/superstore.csv"
}

paths = {k: os.path.join(DATA_RAW_DIR, f"{k}.csv") for k in URLS}

# Download datasets helper
def download_datasets():
    for name, url in URLS.items():
        csv_path = paths[name]
        if not os.path.exists(csv_path):
            print(f"Downloading {name} dataset...")
            try:
                response = requests.get(url, timeout=45)
                response.raise_for_status()
                with open(csv_path, 'wb') as f:
                    f.write(response.content)
                print(f"Downloaded and saved to data/raw/{name}.csv")
            except Exception as e:
                print(f"Error downloading {name}: {e}")
                raise e

# Setup Matplotlib styles
def setup_plot_style():
    plt.style.use('dark_background')
    plt.rcParams['figure.facecolor'] = '#121212'
    plt.rcParams['axes.facecolor'] = '#121212'
    plt.rcParams['savefig.facecolor'] = '#121212'
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica', 'DejaVu Sans']
    plt.rcParams['axes.edgecolor'] = '#252525'
    plt.rcParams['grid.color'] = '#252525'
    plt.rcParams['grid.linestyle'] = '--'
    plt.rcParams['grid.linewidth'] = 0.5
    plt.rcParams['xtick.color'] = '#888888'
    plt.rcParams['ytick.color'] = '#888888'
    plt.rcParams['axes.labelcolor'] = '#cccccc'

def clean_chart(ax):
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#252525')
    ax.spines['bottom'].set_color('#252525')
    ax.yaxis.grid(True, zorder=0)
    ax.xaxis.grid(False)

# Color variables matching the dashboard theme
THEME_BLUE = '#00ADB5'
THEME_PURPLE = '#7952B3'
THEME_RED = '#E50914'
THEME_ORANGE = '#FF5722'

# Global dictionary to store computed metrics
portfolio_metrics = {}

# =====================================================================
# CASE STUDY 1: NETFLIX
# =====================================================================
def run_netflix_analysis():
    print("\n--- Running Case Study 1: Netflix content analysis ---")
    df = pd.read_csv(paths["netflix"])
    
    # Cleaning
    df['director'] = df['director'].fillna('Not Specified')
    df['cast'] = df['cast'].fillna('Not Specified')
    df['country'] = df['country'].fillna('Unknown')
    df['date_added'] = df['date_added'].str.strip()
    df['date_added_dt'] = pd.to_datetime(df['date_added'], format='%B %d, %Y', errors='coerce')
    df['year_added'] = df['date_added_dt'].dt.year.astype('Int64')
    df['rating'] = df['rating'].fillna('Unrated')
    
    # Swapped fixes
    swapped_mask = df['rating'].str.contains('min|Season', na=False)
    if swapped_mask.any():
        df.loc[swapped_mask, 'duration'] = df.loc[swapped_mask, 'rating']
        df.loc[swapped_mask, 'rating'] = 'Unrated'
    df['duration'] = df['duration'].fillna('Unknown')

    # Explode countries and genres for statistics
    country_s = df['country'].str.split(', ').explode()
    top_country = country_s[country_s != 'Unknown'].value_counts().index[0]
    
    genre_s = df['listed_in'].str.split(', ').explode()
    top_genre = genre_s.value_counts().index[0]
    
    movies_count = int((df['type'] == 'Movie').sum())
    tv_count = int((df['type'] == 'TV Show').sum())
    total_count = len(df)
    
    # Store metrics
    portfolio_metrics["netflix"] = {
        "total_titles": total_count,
        "total_movies": movies_count,
        "total_tv_shows": tv_count,
        "movies_pct": round(movies_count / total_count * 100, 1),
        "tv_pct": round(tv_count / total_count * 100, 1),
        "top_country": top_country,
        "top_genre": top_genre
    }

    # Plot 1: Ratio (Donut)
    plt.figure(figsize=(6, 5))
    type_counts = df['type'].value_counts()
    plt.pie(type_counts, labels=type_counts.index, autopct='%1.1f%%', startangle=90, 
            colors=[THEME_RED, '#333333'], wedgeprops={'edgecolor': '#121212', 'linewidth': 2})
    plt.gca().add_artist(plt.Circle((0,0), 0.6, fc='#121212'))
    plt.title('Content Ratio: Movies vs TV Shows', color='#ffffff', pad=15, weight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(CS1_DIR, 'chart_1_ratio.png'), dpi=120)
    plt.close()

    # Plot 2: Added Per Year
    plt.figure(figsize=(9, 5))
    yearly = df.dropna(subset=['year_added'])
    yearly = yearly[yearly['year_added'] <= 2021]
    yearly_counts = yearly.groupby(['year_added', 'type']).size().unstack(fill_value=0)
    plt.plot(yearly_counts.index, yearly_counts['Movie'], marker='o', color=THEME_RED, label='Movies', linewidth=2)
    plt.plot(yearly_counts.index, yearly_counts['TV Show'], marker='s', color='#888888', label='TV Shows', linewidth=2)
    plt.fill_between(yearly_counts.index, yearly_counts['Movie'], color=THEME_RED, alpha=0.1)
    plt.fill_between(yearly_counts.index, yearly_counts['TV Show'], color='#888888', alpha=0.1)
    clean_chart(plt.gca())
    plt.title('Content Additions Trend (2008-2021)', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Year Added')
    plt.ylabel('Number of Titles')
    plt.legend(facecolor='#181818', edgecolor='#333333')
    plt.tight_layout()
    plt.savefig(os.path.join(CS1_DIR, 'chart_2_added.png'), dpi=120)
    plt.close()

    # Plot 3: Top Countries
    plt.figure(figsize=(9, 5))
    top_countries = country_s[country_s != 'Unknown'].value_counts().head(10)
    sns.barplot(x=top_countries.values, y=top_countries.index, color=THEME_RED)
    ax = plt.gca()
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#252525')
    ax.spines['bottom'].set_color('#252525')
    ax.xaxis.grid(True, zorder=0, color='#252525', linestyle='--')
    plt.title('Top 10 Content Producing Countries', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Count of Titles')
    plt.ylabel('Country')
    plt.tight_layout()
    plt.savefig(os.path.join(CS1_DIR, 'chart_3_countries.png'), dpi=120)
    plt.close()

    # Plot 4: Rating Classifications
    plt.figure(figsize=(9, 5))
    rating_counts = df['rating'].value_counts().head(8)
    sns.barplot(x=rating_counts.index, y=rating_counts.values, palette='Reds_r')
    clean_chart(plt.gca())
    plt.title('Distribution of Ratings (Top 8)', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Rating Category')
    plt.ylabel('Count of Titles')
    plt.tight_layout()
    plt.savefig(os.path.join(CS1_DIR, 'chart_4_ratings.png'), dpi=120)
    plt.close()

    # Export Processed Data subset
    columns_keep = ['show_id', 'type', 'title', 'director', 'cast', 'country', 'date_added', 'release_year', 'rating', 'duration', 'listed_in']
    df[columns_keep].to_csv(os.path.join(DATA_PROCESSED_DIR, 'netflix_cleaned.csv'), index=False)
    print("Netflix analysis complete.")

# =====================================================================
# CASE STUDY 2: CUSTOMER CHURN
# =====================================================================
def run_churn_analysis():
    print("\n--- Running Case Study 2: Telecom Customer Churn analysis ---")
    df = pd.read_csv(paths["churn"])

    # Preprocessing
    # TotalCharges contains blank spaces, replace with NaN, validate data types
    df['TotalCharges'] = df['TotalCharges'].str.strip()
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
    
    # Handle missing values: Fill TotalCharges NaN with 0 or tenure * MonthlyCharges
    nan_charges_mask = df['TotalCharges'].isna()
    df.loc[nan_charges_mask, 'TotalCharges'] = df.loc[nan_charges_mask, 'tenure'] * df.loc[nan_charges_mask, 'MonthlyCharges']
    
    # Churn mappings
    df['ChurnNumeric'] = df['Churn'].apply(lambda x: 1 if x == 'Yes' else 0)

    # NumPy Statistical summaries
    tenure_arr = df['tenure'].to_numpy()
    monthly_arr = df['MonthlyCharges'].to_numpy()
    total_arr = df['TotalCharges'].to_numpy()
    
    churn_yes = df[df['Churn'] == 'Yes']
    churn_no = df[df['Churn'] == 'No']
    
    churn_rate = float(df['ChurnNumeric'].mean() * 100)
    mean_tenure = float(np.mean(tenure_arr))
    median_monthly = float(np.median(monthly_arr))
    mean_monthly_churned = float(np.mean(churn_yes['MonthlyCharges'].to_numpy()))
    mean_monthly_retained = float(np.mean(churn_no['MonthlyCharges'].to_numpy()))
    
    # Store metrics
    portfolio_metrics["churn"] = {
        "total_records": len(df),
        "churn_rate": round(churn_rate, 1),
        "mean_tenure_months": round(mean_tenure, 1),
        "median_monthly_charges": round(median_monthly, 2),
        "churned_mean_charges": round(mean_monthly_churned, 2),
        "retained_mean_charges": round(mean_monthly_retained, 2),
        "top_contract_churned": str(churn_yes['Contract'].value_counts().index[0])
    }

    # Plot 1: Churn Distribution (Ratio)
    plt.figure(figsize=(6, 5))
    churn_counts = df['Churn'].value_counts()
    plt.bar(churn_counts.index, churn_counts.values, color=[THEME_BLUE, THEME_PURPLE], width=0.6, zorder=3)
    clean_chart(plt.gca())
    plt.title('Customer Churn Distribution (Yes vs No)', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Churned Status')
    plt.ylabel('Number of Customers')
    plt.tight_layout()
    plt.savefig(os.path.join(CS2_DIR, 'chart_1_ratio.png'), dpi=120)
    plt.close()

    # Plot 2: Churn by Contract Type
    plt.figure(figsize=(8, 5))
    contract_churn = df.groupby(['Contract', 'Churn']).size().unstack(fill_value=0)
    contract_churn_pct = contract_churn.div(contract_churn.sum(axis=1), axis=0) * 100
    
    contract_churn_pct.plot(kind='bar', stacked=True, color=[THEME_BLUE, THEME_PURPLE], ax=plt.gca(), width=0.5)
    clean_chart(plt.gca())
    plt.title('Churn Rate (%) by Contract Type', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Contract Type')
    plt.ylabel('Percentage (%)')
    plt.xticks(rotation=0)
    plt.legend(['Retained', 'Churned'], facecolor='#181818', edgecolor='#333333')
    plt.tight_layout()
    plt.savefig(os.path.join(CS2_DIR, 'chart_2_contract_churn.png'), dpi=120)
    plt.close()

    # Plot 3: Monthly Charges Box Plot
    plt.figure(figsize=(8, 5))
    sns.boxplot(x='Churn', y='MonthlyCharges', data=df, palette=[THEME_BLUE, THEME_PURPLE])
    clean_chart(plt.gca())
    plt.title('Monthly Charges Distribution for Churn vs Retained', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Churned Status')
    plt.ylabel('Monthly Charges ($)')
    plt.tight_layout()
    plt.savefig(os.path.join(CS2_DIR, 'chart_3_charges_box.png'), dpi=120)
    plt.close()

    # Plot 4: Tenure distribution for Churned vs Retained
    plt.figure(figsize=(8, 5))
    sns.histplot(data=df, x='tenure', hue='Churn', kde=True, element='step', 
                 palette=[THEME_BLUE, THEME_PURPLE], alpha=0.4, bins=30, zorder=3)
    clean_chart(plt.gca())
    plt.title('Customer Tenure Distribution by Churn Status', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Tenure (Months)')
    plt.ylabel('Count of Customers')
    plt.tight_layout()
    plt.savefig(os.path.join(CS2_DIR, 'chart_4_tenure_dist.png'), dpi=120)
    plt.close()

    # Export Processed Data subset
    columns_keep = ['customerID', 'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 'PhoneService', 'MultipleLines', 'InternetService', 'Contract', 'PaperlessBilling', 'PaymentMethod', 'MonthlyCharges', 'TotalCharges', 'Churn']
    df[columns_keep].to_csv(os.path.join(DATA_PROCESSED_DIR, 'churn_cleaned.csv'), index=False)
    print("Churn analysis complete.")

# =====================================================================
# CASE STUDY 3: SPOTIFY
# =====================================================================
def run_spotify_analysis():
    print("\n--- Running Case Study 3: Spotify Tracks analysis ---")
    df = pd.read_csv(paths["spotify"], encoding='latin-1')

    # Preprocessing
    # Stream column may contain non-numeric data, force to numeric
    df['streams'] = pd.to_numeric(df['streams'], errors='coerce')
    df = df.dropna(subset=['streams'])
    
    # Sort by streams to get top track
    df_sorted = df.sort_values(by='streams', ascending=False)
    top_track = df_sorted.iloc[0]['track_name']
    top_artist = df_sorted.iloc[0]['artist(s)_name']
    
    mean_dance = float(df['danceability_%'].mean())
    mean_energy = float(df['energy_%'].mean())
    mean_valence = float(df['valence_%'].mean())
    
    # Store metrics
    portfolio_metrics["spotify"] = {
        "total_tracks": len(df),
        "top_track": top_track,
        "top_artist": top_artist,
        "mean_danceability_pct": round(mean_dance, 1),
        "mean_energy_pct": round(mean_energy, 1),
        "mean_valence_pct": round(mean_valence, 1),
        "median_bpm": float(df['bpm'].median())
    }

    # Plot 1: Top 10 Popular Tracks (Streams)
    plt.figure(figsize=(9, 5))
    top_10 = df_sorted.head(10)
    # Truncate long track names for chart display
    track_labels = [t[:18] + '...' if len(t) > 18 else t for t in top_10['track_name']]
    sns.barplot(x=top_10['streams'] / 1e9, y=track_labels, color=THEME_BLUE)
    ax = plt.gca()
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#252525')
    ax.spines['bottom'].set_color('#252525')
    ax.xaxis.grid(True, zorder=0, color='#252525', linestyle='--')
    plt.title('Top 10 Most Streamed Tracks (Billions)', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Streams (in Billions)')
    plt.ylabel('Track Name')
    plt.tight_layout()
    plt.savefig(os.path.join(CS3_DIR, 'chart_1_popularity.png'), dpi=120)
    plt.close()

    # Plot 2: Correlation Heatmap
    plt.figure(figsize=(7, 6))
    features = ['bpm', 'danceability_%', 'valence_%', 'energy_%', 'acousticness_%', 'instrumentalness_%', 'liveness_%', 'speechiness_%', 'streams']
    corr = df[features].corr()
    sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f", vmin=-1, vmax=1, 
                cbar_kws={'label': 'Correlation Coefficient'}, square=True)
    plt.title('Correlation Heatmap of Audio Features', color='#ffffff', pad=20, weight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(CS3_DIR, 'chart_2_correlation.png'), dpi=120)
    plt.close()

    # Plot 3: Acousticness vs Energy Scatter
    plt.figure(figsize=(8, 5))
    sns.scatterplot(x='acousticness_%', y='energy_%', data=df, color=THEME_BLUE, alpha=0.6, edgecolor=None)
    clean_chart(plt.gca())
    plt.title('Relationship: Acousticness vs Energy', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Acousticness (%)')
    plt.ylabel('Energy (%)')
    plt.tight_layout()
    plt.savefig(os.path.join(CS3_DIR, 'chart_3_acoustic_energy.png'), dpi=120)
    plt.close()

    # Plot 4: BPM Distribution
    plt.figure(figsize=(8, 5))
    sns.histplot(data=df, x='bpm', color=THEME_BLUE, kde=True, bins=25, zorder=3)
    clean_chart(plt.gca())
    plt.title('Tempo Distribution (BPM) of Hit Tracks', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Beats Per Minute (BPM)')
    plt.ylabel('Count of Tracks')
    plt.tight_layout()
    plt.savefig(os.path.join(CS3_DIR, 'chart_4_bpm_dist.png'), dpi=120)
    plt.close()

    # Export Processed Data subset
    columns_keep = ['track_name', 'artist(s)_name', 'artist_count', 'released_year', 'released_month', 'released_day', 'in_spotify_playlists', 'in_spotify_charts', 'streams', 'bpm', 'key', 'mode', 'danceability_%', 'valence_%', 'energy_%', 'acousticness_%']
    df[columns_keep].to_csv(os.path.join(DATA_PROCESSED_DIR, 'spotify_cleaned.csv'), index=False)
    print("Spotify analysis complete.")

# =====================================================================
# CASE STUDY 4: SUPERSTORE
# =====================================================================
def run_superstore_analysis():
    print("\n--- Running Case Study 4: Superstore Sales analysis ---")
    # Load dataset, decode with Windows-1252 or Latin-1
    df = pd.read_csv(paths["superstore"], encoding='windows-1252')

    # Preprocessing
    df['Sales'] = pd.to_numeric(df['Sales'], errors='coerce')
    df['Profit'] = pd.to_numeric(df['Profit'], errors='coerce')
    df = df.dropna(subset=['Sales', 'Profit'])

    total_sales = float(df['Sales'].sum())
    total_profit = float(df['Profit'].sum())
    profit_margin = float(total_profit / total_sales * 100)
    
    category_summary = df.groupby('Category').agg({'Sales': 'sum', 'Profit': 'sum'})
    top_cat = str(category_summary['Sales'].idxmax())
    
    # Store metrics
    portfolio_metrics["superstore"] = {
        "total_transactions": len(df),
        "total_sales": round(total_sales, 2),
        "total_profit": round(total_profit, 2),
        "profit_margin_pct": round(profit_margin, 2),
        "top_category": top_cat,
        "total_quantity": int(df['Quantity'].sum())
    }

    # Plot 1: Sales by Category
    plt.figure(figsize=(7, 5))
    sales_cat = df.groupby('Category')['Sales'].sum().sort_values(ascending=False)
    sns.barplot(x=sales_cat.index, y=sales_cat.values / 1e3, color=THEME_ORANGE, zorder=3)
    clean_chart(plt.gca())
    plt.title('Total Sales by Category ($ Thousands)', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Category')
    plt.ylabel('Sales ($k)')
    plt.tight_layout()
    plt.savefig(os.path.join(CS4_DIR, 'chart_1_sales_cat.png'), dpi=120)
    plt.close()

    # Plot 2: Profit by Segment and Region
    plt.figure(figsize=(9, 5))
    segment_region = df.groupby(['Region', 'Segment'])['Profit'].sum().unstack()
    segment_region.plot(kind='bar', color=['#333333', THEME_ORANGE, '#aaaaaa'], ax=plt.gca(), width=0.6, zorder=3)
    clean_chart(plt.gca())
    plt.title('Profit Contribution by Segment & Region', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Region')
    plt.ylabel('Profit ($)')
    plt.xticks(rotation=0)
    plt.legend(facecolor='#181818', edgecolor='#333333')
    plt.tight_layout()
    plt.savefig(os.path.join(CS4_DIR, 'chart_2_profit_segment.png'), dpi=120)
    plt.close()

    # Plot 3: Sub-Category Profitability (Horizontal Bar)
    plt.figure(figsize=(9, 6))
    subcat_profit = df.groupby('Sub-Category')['Profit'].sum().sort_values()
    # Create color list: red for negative profit, orange/blue for positive profit
    colors = ['#d9534f' if x < 0 else THEME_ORANGE for x in subcat_profit.values]
    plt.barh(subcat_profit.index, subcat_profit.values, color=colors, zorder=3)
    ax = plt.gca()
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#252525')
    ax.spines['bottom'].set_color('#252525')
    ax.xaxis.grid(True, zorder=0, color='#252525', linestyle='--')
    plt.title('Profitability by Product Sub-Category', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Total Profit ($)')
    plt.ylabel('Sub-Category')
    plt.tight_layout()
    plt.savefig(os.path.join(CS4_DIR, 'chart_3_subcat_profit.png'), dpi=120)
    plt.close()

    # Plot 4: Sales Over Time (Monthly Trend)
    plt.figure(figsize=(10, 5))
    df['Order Date'] = pd.to_datetime(df['Order Date'], errors='coerce')
    df_time = df.dropna(subset=['Order Date']).copy()
    df_time['YearMonth'] = df_time['Order Date'].dt.to_period('M')
    monthly_sales = df_time.groupby('YearMonth')['Sales'].sum()
    
    # Plot line
    plt.plot(monthly_sales.index.astype(str), monthly_sales.values / 1e3, marker='o', color=THEME_ORANGE, linewidth=2)
    plt.fill_between(monthly_sales.index.astype(str), monthly_sales.values / 1e3, color=THEME_ORANGE, alpha=0.1)
    
    ax = plt.gca()
    clean_chart(ax)
    plt.title('Monthly Sales Trend Over Years ($ Thousands)', color='#ffffff', pad=15, weight='bold')
    plt.xlabel('Order Period (Month)')
    plt.ylabel('Sales ($k)')
    
    # Show every 4th tick label to prevent overcrowding
    ticks = ax.get_xticks()
    labels = ax.get_xticklabels()
    ax.set_xticks(ticks[::4])
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.savefig(os.path.join(CS4_DIR, 'chart_4_sales_time.png'), dpi=120)
    plt.close()

    # Export Processed Data subset
    columns_keep = ['Order ID', 'Order Date', 'Ship Mode', 'Segment', 'Region', 'Country', 'State', 'City', 'Category', 'Sub-Category', 'Product Name', 'Sales', 'Quantity', 'Discount', 'Profit']
    df[columns_keep].to_csv(os.path.join(DATA_PROCESSED_DIR, 'superstore_cleaned.csv'), index=False)
    print("Superstore analysis complete.")

# =====================================================================
# MAIN PIPELINE
# =====================================================================
if __name__ == "__main__":
    setup_plot_style()
    
    # Download datasets
    download_datasets()
    
    # Run Case Studies
    run_netflix_analysis()
    run_churn_analysis()
    run_spotify_analysis()
    run_superstore_analysis()
    
    # Write combined portfolio metrics JSON
    with open(os.path.join(DATA_PROCESSED_DIR, 'portfolio_metrics.json'), 'w') as f:
        json.dump(portfolio_metrics, f, indent=4)
        
    print("\n==============================================")
    print("All 4 data analysis case studies ran successfully!")
    print("==============================================")
