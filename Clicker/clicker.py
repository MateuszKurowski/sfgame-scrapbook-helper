import pyautogui
import time

def simulate_arrow_down():
    try:
        while True:
            pyautogui.press('down')
            time.sleep(1)
    except KeyboardInterrupt:
        print("Symulacja zakończona.")

simulate_arrow_down()
