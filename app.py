import streamlit as st
import google.generativeai as genai

# --- PENGATURAN KEAMANAN ---
PASSWORD_RAHASIA = "rifanganteng" # Ganti dengan password pilihan Anda

# --- KONFIGURASI AI ---
# Masukkan API Key Anda di sini
genai.configure(api_key="AIzaSyApWiv0jaEkaB-pC2Au5015hDoZpiAAX-E")
model = genai.GenerativeModel('gemini-1.5-flash')

st.set_page_config(page_title="My Secret AI App")

# Tampilan Login Sederhana
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False

if not st.session_state.authenticated:
    st.title("🔐 Akses Terbatas")
    user_pass = st.text_input("Masukkan Password untuk Menggunakan AI:", type="password")
    if st.button("Masuk"):
        if user_pass == PASSWORD_RAHASIA:
            st.session_state.authenticated = True
            st.rerun()
        else:
            st.error("Password Salah!")
else:
    # --- TAMPILAN APLIKASI SETELAH LOGIN ---
    st.title("INI Tinggal Masuk")
    st.write("Selamat datang! Hanya Anda yang punya link dan password yang bisa di sini.")
    
    user_input = st.text_input("Ketik pertanyaan Anda:")
    if st.button("Tanya AI"):
        if user_input:
            response = model.generate_content(user_input)
            st.markdown(f"**Jawaban:** \n\n {response.text}")
