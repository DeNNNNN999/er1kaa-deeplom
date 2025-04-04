import { Outlet } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Plane, Map, Compass, Sun, Ship, Cloud, Landmark, Trees, Umbrella } from 'lucide-react'

export default function AuthLayout() {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);
  const [clouds, setClouds] = useState([]);
  const [islands, setIslands] = useState([]);
  const [waves, setWaves] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [mountains, setMountains] = useState([]);
  const planeRef = useRef(null);
  const sunRef = useRef(null);
  const boatRef = useRef(null);
  const compassRef = useRef(null);
  const mapRef = useRef(null);
  
  // Генерация элементов случайным образом для создания уникальной сцены
  useEffect(() => {
    // Создаем облака с разными размерами и скоростями
    const newClouds = Array.from({ length: 10 }).map((_, i) => ({
      id: `cloud-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 15 + 5, 
      size: Math.random() * 40 + 30,
      speed: Math.random() * 10 + 5,
      opacity: Math.random() * 0.5 + 0.3,
      delay: Math.random() * 10
    }));
    setClouds(newClouds);
    
    // Создаем острова на горизонте
    const newIslands = Array.from({ length: 3 }).map((_, i) => ({
      id: `island-${i}`,
      x: 15 + i * 30,
      width: Math.random() * 15 + 5,
      height: Math.random() * 3 + 1,
    }));
    setIslands(newIslands);
    
    // Создаем волны
    const newWaves = Array.from({ length: 8 }).map((_, i) => ({
      id: `wave-${i}`,
      y: 60 + i * 3,
      amplitude: 0.6 - (i * 0.05),
      frequency: 0.02 + (i * 0.002),
      phase: i * 10,
      opacity: 0.9 - (i * 0.1)
    }));
    setWaves(newWaves);
    
    // Создаем летающие самолеты
    const newPlanes = Array.from({ length: 3 }).map((_, i) => ({
      id: `plane-${i}`,
      startX: -10,
      startY: Math.random() * 20 + 5,
      scale: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 20 + 40,
      delay: Math.random() * 15 + i * 10,
      rotate: Math.random() * 10 - 5
    }));
    setPlanes(newPlanes);
    
    // Создаем горы на горизонте
    const newMountains = Array.from({ length: 8 }).map((_, i) => {
      const width = Math.random() * 20 + 10;
      return {
        id: `mountain-${i}`,
        x: Math.random() * 100,
        width: width,
        height: Math.random() * 15 + 5,
        color: `hsl(${220 + Math.random() * 40}, ${20 + Math.random() * 10}%, ${20 + Math.random() * 15}%)`
      };
    });
    setMountains(newMountains);
  }, []);
  
  // Главный эффект анимации
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevTime => prevTime + 0.05);
    }, 50);
    
    // Для интерактивного отслеживания движения мыши
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMousePosition({ x, y });
      
      // Реакция элементов на движение мыши
      if (planeRef.current) {
        planeRef.current.style.transform = `translate(${(x - 50) / 10}px, ${(y - 50) / 20}px) rotate(${(x - 50) / 40}deg)`;
      }
      
      if (sunRef.current) {
        sunRef.current.style.transform = `translate(${(x - 50) / 20}px, ${(y - 50) / 30}px)`;
      }
      
      if (boatRef.current) {
        boatRef.current.style.transform = `translate(${(x - 50) / 6}px, ${Math.sin(time) * 3}px) rotate(${Math.sin(time) * 2}deg)`;
      }
      
      if (compassRef.current) {
        compassRef.current.style.transform = `rotate(${x / 2}deg)`;
      }
      
      if (mapRef.current) {
        mapRef.current.style.transform = `perspective(1000px) rotateX(${(y - 50) / 10}deg) rotateY(${(x - 50) / 10}deg)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [time]);
  
  // Генерация SVG пути для волн
  const generateWavePath = (waveObj) => {
    let path = `M0,${waveObj.y}`;
    
    for (let x = 0; x <= 100; x += 1) {
      const y = waveObj.y + Math.sin((x * waveObj.frequency) + time + waveObj.phase) * waveObj.amplitude * 10;
      path += ` L${x},${y}`;
    }
    
    path += ` L100,100 L0,100 Z`;
    return path;
  };

  // Рисование силуэта горы
  const getMountainPath = (mountain) => {
    const { x, width, height } = mountain;
    const peak = x + width / 2;
    return `M${x},50 L${peak},${50 - height} L${x + width},50 Z`;
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full overflow-hidden flex items-center justify-center relative"
    >
      {/* Небо с градиентом времени суток */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300"></div>
      
      {/* Солнце */}
      <div 
        ref={sunRef} 
        className="absolute w-32 h-32 rounded-full top-16 right-1/4 transition-transform duration-1000"
      >
        <div className="absolute inset-0 rounded-full bg-yellow-200 opacity-30 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full bg-yellow-300 opacity-50"></div>
        <div className="absolute inset-4 rounded-full bg-yellow-400 opacity-70"></div>
        <div className="absolute inset-6 rounded-full bg-yellow-500"></div>
        <Sun className="absolute inset-0 w-full h-full text-yellow-400 opacity-90" />
      </div>
      
      {/* Облака */}
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute rounded-full opacity-60 transform-gpu"
          style={{
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            top: `${cloud.y}%`,
            left: `${cloud.x}%`,
            backgroundColor: 'white',
            boxShadow: '0 0 40px 5px rgba(255, 255, 255, 0.4)',
            opacity: cloud.opacity,
            transform: `translateX(${Math.sin(time + cloud.delay) * 5}%)`,
            transition: 'transform 3s ease-in-out'
          }}
        >
          <Cloud className="absolute inset-0 w-full h-full text-white opacity-80" />
        </div>
      ))}
      
      {/* Горы на горизонте */}
      <div className="absolute top-[50%] left-0 w-full">
        <svg className="w-full h-20 overflow-visible">
          {mountains.map((mountain) => (
            <path
              key={mountain.id}
              d={getMountainPath(mountain)}
              fill={mountain.color}
              opacity={0.9}
            />
          ))}
        </svg>
      </div>
      
      {/* Острова */}
      {islands.map((island) => (
        <div 
          key={island.id}
          className="absolute rounded-tr-full rounded-tl-full overflow-hidden"
          style={{
            width: `${island.width}%`,
            height: `${island.height}%`,
            bottom: '40%',
            left: `${island.x}%`,
            backgroundColor: '#2d3748',
            boxShadow: '0 -5px 15px rgba(0,0,0,0.1)'
          }}
        >
          <div 
            className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/4"
            style={{
              width: '30%',
              height: '120%'
            }}
          >
            <Trees className="w-full h-full text-green-800 opacity-80" />
          </div>
        </div>
      ))}
      
      {/* Волны */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg width="100%" height="50%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {waves.map((wave) => (
            <path
              key={wave.id}
              d={generateWavePath(wave)}
              fill={`rgba(59, 130, 246, ${wave.opacity})`}
              className="transition-all duration-1000"
            />
          ))}
        </svg>
      </div>
      
      {/* Плывущая лодка */}
      <div 
        ref={boatRef}
        className="absolute bottom-[35%] left-[60%] w-20 h-10 transition-transform duration-1000"
      >
        <Ship className="w-full h-full text-gray-800 opacity-80" />
      </div>
      
      {/* Летающие самолеты */}
      {planes.map((plane) => (
        <div
          key={plane.id}
          className="absolute transition-all duration-1000"
          style={{
            top: `${plane.startY}%`,
            left: `${((time * plane.speed) + plane.delay) % 130 - 10}%`,
            transform: `scale(${plane.scale}) rotate(${plane.rotate}deg)`,
            zIndex: 2
          }}
        >
          <Plane className="w-8 h-8 text-white opacity-60" />
        </div>
      ))}
      
      {/* Декоративные элементы интерфейса */}
      <div className="absolute top-6 left-6 transition-transform duration-1000 opacity-50">
        <div ref={compassRef} className="w-12 h-12 transition-transform duration-1000">
          <Compass className="w-full h-full text-white" />
        </div>
      </div>
      
      <div 
        ref={mapRef}
        className="absolute bottom-10 right-10 w-16 h-16 transition-transform duration-1000 opacity-50"
      >
        <Map className="w-full h-full text-white" />
      </div>
      
      {/* Самолет в центре, который реагирует на движения мыши */}
      <div 
        ref={planeRef}
        className="absolute top-1/4 right-1/4 w-12 h-12 transition-transform duration-700 opacity-80"
      >
        <Plane className="w-full h-full text-white transform rotate-45" />
      </div>
      
      {/* Отель/Достопримечательность */}
      <div className="absolute bottom-20 left-20 opacity-60">
        <Landmark className="w-12 h-12 text-gray-100" />
      </div>
      
      {/* Пляжный зонтик */}
      <div className="absolute bottom-12 right-20 opacity-60">
        <Umbrella className="w-10 h-10 text-gray-100" />
      </div>
      
      {/* Основной контент (формы входа/регистрации) */}
      <div className="relative max-w-md w-full z-10">
        <Outlet />
      </div>
      
      {/* Парящие частицы */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={`particle-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* CSS для анимаций */}
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-35px) translateX(-5px);
          }
          75% {
            transform: translateY(-20px) translateX(-10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
        
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
