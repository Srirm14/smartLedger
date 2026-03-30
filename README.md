# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# Local Run and Testing 

- change the .env file to point to the backend host (usually localhost:3100)
- docker-compose up

# To push changes to docker hub

- docker login --username navnitan
- docker build -t navnitan/petrol_bunk_manager:frontend .
- docker push navnitan/petrol_bunk_manager:frontend





